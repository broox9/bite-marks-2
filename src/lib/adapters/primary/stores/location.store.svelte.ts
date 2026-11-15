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
const DEFAULT_LOCATION_ID_STORAGE_PREFIX = 'bite-marks-default-location-id:'

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
let defaultLocationIdKey: string | null = null
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

function writeStorage(key: string | null, value: string | null) {
  if (!key) return
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch (error) {
    console.error('[bs] LOCATION::STORE::persist', error)
  }
}

function persist() {
  writeStorage(storageKey, JSON.stringify(snapshot()))
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

function isSameCoords(a: { lat: number; lng: number }, b: { lat: number; lng: number }): boolean {
  return Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6
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
   * Synchronizes the store with a newly selected default location and records
   * the default id so subsequent hydrations do not revert to an older cache.
   */
  setDefault(location: SavedLocation) {
    generation++
    apply(activeLocationFromSaved(location))
    writeStorage(defaultLocationIdKey, location.id)
    persist()
  },

  /**
   * Restores this user's last-used location on this device, reconciling it with
   * their saved locations and newly selected default.
   */
  async hydrate(userId: string, loadSavedLocations: () => Promise<SavedLocation[]>) {
    const key = ACTIVE_LOCATION_STORAGE_PREFIX + userId
    const defaultKey = DEFAULT_LOCATION_ID_STORAGE_PREFIX + userId
    if (storageKey !== key) {
      generation++
      apply(FALLBACK_LOCATION)
    }
    storageKey = key
    defaultLocationIdKey = defaultKey

    const cached = parseActiveLocation(readStorage(key))
    if (cached) {
      apply(cached)
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
    const lastKnownDefaultId = readStorage(defaultKey)
    writeStorage(defaultKey, defaultLocation?.id ?? null)

    if (!cached) {
      if (defaultLocation) {
        apply(activeLocationFromSaved(defaultLocation))
        persist()
      }
      return
    }

    // If the user's saved default changed since this device last synced (or was
    // set for the first time while an older cached pick existed), switch to the
    // new default unless the cached pick already points to it.
    if (
      defaultLocation &&
      defaultLocation.id !== lastKnownDefaultId &&
      cached.savedLocationId !== defaultLocation.id
    ) {
      apply(activeLocationFromSaved(defaultLocation))
      persist()
      return
    }

    if (cached.savedLocationId !== null) {
      const matchedSaved = saved.find((loc) => loc.id === cached.savedLocationId)
      if (!matchedSaved) {
        if (defaultLocation) {
          apply(activeLocationFromSaved(defaultLocation))
        } else {
          apply({ ...cached, savedLocationId: null })
        }
        persist()
      } else if (matchedSaved.name !== cached.name || !isSameCoords(matchedSaved, cached.center)) {
        apply({
          ...cached,
          name: matchedSaved.name,
          center: { lat: matchedSaved.lat, lng: matchedSaved.lng },
        })
        persist()
      }
    } else if (defaultLocation && isSameCoords(defaultLocation, cached.center)) {
      apply(activeLocationFromSaved(defaultLocation))
      persist()
    }
  },

  /** Forgets the signed-in user; called on sign-out. */
  reset() {
    generation++
    storageKey = null
    defaultLocationIdKey = null
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
