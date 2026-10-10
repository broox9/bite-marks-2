import {
  activeLocationFromSaved,
  clampRadiusMiles,
  findDefaultLocation,
  parseActiveLocation,
  type ActiveLocation,
  type SavedLocation,
} from "$lib/core/domain/Location/Location";

// Module state is shared across SSR requests: only write it from the browser
// (event handlers, effects, `hydrate`), never during server rendering.

const ACTIVE_LOCATION_STORAGE_PREFIX = 'bite-marks-active-location:'

const FALLBACK_LOCATION: ActiveLocation = {
  name: 'Midtown, New York',
  center: { lat: 40.7484, lng: -73.9857 },
  radiusMiles: 29,
  savedLocationId: null,
}

let center = $state({ ...FALLBACK_LOCATION.center })
let name = $state(FALLBACK_LOCATION.name)
let radiusMiles = $state(FALLBACK_LOCATION.radiusMiles)
let savedLocationId = $state<string | null>(FALLBACK_LOCATION.savedLocationId)
let radiusMeters = $derived(radiusMiles * 1609.34)

let storageKey: string | null = null
// Bumped on every change so an in-flight `hydrate` can't clobber a newer pick.
let generation = 0

function apply(location: ActiveLocation) {
  name = location.name
  center = { ...location.center }
  radiusMiles = clampRadiusMiles(location.radiusMiles)
  savedLocationId = location.savedLocationId
}

function snapshot(): ActiveLocation {
  return { name, center: { ...center }, radiusMiles, savedLocationId }
}

function persist() {
  if (!storageKey) return
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot()))
  } catch (error) {
    console.error('[bs] LOCATION::STORE::persist', error)
  }
}

// A storage read that throws (blocked storage, privacy modes) is a cache miss,
// so hydration still falls through to the cloud default.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('[bs] LOCATION::STORE::readStorage', error)
    return null
  }
}

/*
Google Places
"Text Search" takes a `locationBias.circle.center` (lat/lng) ~ "Pizza in New York"
"Nearby Search" takes `locationRestriction.circle.center` (lat/lng) and `locationRestriction.circle.radius` (meters) + types
"Autocomplete" also takes `locationBias.circle.center` (lat/lng) and `locationRestriction.circle.radius` (meters) + input

*/


export const locationStore = {
  get name() {
    return name
  },
  get center() {
    return center
  },
  get radiusMiles() {
    return radiusMiles
  },
  set radiusMiles(newRadius) {
    generation++
    radiusMiles = clampRadiusMiles(newRadius)
    persist()
  },
  get radiusMeters() {
    return radiusMeters
  },
  /** Id of the saved location this came from, or null for an unsaved pick. */
  get savedLocationId() {
    return savedLocationId
  },
  get snapshot(): ActiveLocation {
    return snapshot()
  },

  /** Makes `location` the active one and remembers it on this device. */
  setActive(location: Omit<ActiveLocation, 'radiusMiles'> & { radiusMiles?: number }) {
    generation++
    apply({ ...location, radiusMiles: location.radiusMiles ?? radiusMiles })
    persist()
  },

  /**
   * Restores this user's last-used location on this device, falling back to
   * their saved default when nothing is cached.
   */
  async hydrate(userId: string, loadSavedLocations: () => Promise<SavedLocation[]>) {
    const key = ACTIVE_LOCATION_STORAGE_PREFIX + userId
    if (storageKey !== key) {
      generation++
      apply(FALLBACK_LOCATION)
    }
    storageKey = key

    const cached = parseActiveLocation(readStorage(key))
    if (cached) {
      apply(cached)
      return
    }

    const requestGeneration = generation
    let saved: SavedLocation[]
    try {
      saved = await loadSavedLocations()
    } catch (error) {
      console.error('[bs] LOCATION::STORE::hydrate', error)
      return
    }
    if (requestGeneration !== generation || storageKey !== key) return

    const defaultLocation = findDefaultLocation(saved)
    if (defaultLocation) {
      apply(activeLocationFromSaved(defaultLocation))
      persist()
    }
  },

  /** Forgets the signed-in user; called on sign-out. */
  reset() {
    generation++
    storageKey = null
    apply(FALLBACK_LOCATION)
  },

  getBounds() {
    // return this.bounds
        return {
            east: center.lng - 0.03,//-74.1,
            west: center.lng + 0.03,//-74.2,
            north: center.lat + 0.04,//40.8,
            south: center.lat - 0.04,//40.7
        }
    }
}
