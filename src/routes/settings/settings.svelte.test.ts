// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { SavedLocation } from '$lib/core/domain/Location/Location';
import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
import {
  createSavedLocation,
  deleteSavedLocation,
  listSavedLocations,
  setDefaultSavedLocation,
  updateSavedLocation,
} from '$lib/adapters/primary/remote-handlers/savedLocations.remote';
import SettingsPage from './+page.svelte';

vi.mock('$app/state', () => ({
  page: {
    data: {
      user: {
        id: 'user-1',
        name: 'Brookes Stephens',
        email: 'brookes@example.com',
      },
    },
  },
}));

vi.mock('$lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

vi.mock('$lib/adapters/secondary/google/google.svelte', () => ({
  searchForAreas: vi.fn(),
}));

vi.mock('$lib/adapters/primary/remote-handlers/savedLocations.remote', () => ({
  listSavedLocations: vi.fn(),
  createSavedLocation: vi.fn(),
  updateSavedLocation: vi.fn(),
  setDefaultSavedLocation: vi.fn(),
  deleteSavedLocation: vi.fn(),
}));

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
}

function createQueryResource(initial: {
  current?: SavedLocation[];
  error?: unknown;
  onRefresh?: () => Promise<void> | void;
}) {
  let current = $state<SavedLocation[] | undefined>(initial.current);
  let error = $state<unknown>(initial.error);
  const refresh = vi.fn(async () => {
    await initial.onRefresh?.();
  });

  return {
    get current() {
      return current;
    },
    set current(value: SavedLocation[] | undefined) {
      current = value;
    },
    get error() {
      return error;
    },
    set error(value: unknown) {
      error = value;
    },
    refresh,
  };
}

let component: ReturnType<typeof mount> | undefined;
let target: HTMLDivElement;

function render() {
  component = mount(SettingsPage, { target });
  flushSync();
}

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.spyOn(console, 'error').mockImplementation(() => {});
  locationStore.reset();
  target = document.createElement('div');
  document.body.append(target);
  vi.mocked(listSavedLocations).mockReset();
  vi.mocked(createSavedLocation).mockReset();
  vi.mocked(updateSavedLocation).mockReset();
  vi.mocked(setDefaultSavedLocation).mockReset();
  vi.mocked(deleteSavedLocation).mockReset();
});

afterEach(async () => {
  if (component) {
    await unmount(component);
    component = undefined;
  }
  target.remove();
  locationStore.reset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Settings saved locations', () => {
  it('displays saved locations and the Default badge when the query succeeds', () => {
    const locations: SavedLocation[] = [
      {
        id: 'loc-midtown',
        name: 'Midtown, New York',
        lat: 40.7484,
        lng: -73.9857,
        radiusMiles: 15,
        isDefault: true,
      },
      {
        id: 'loc-philly',
        name: 'Philadelphia, PA',
        lat: 39.9526,
        lng: -75.1652,
        radiusMiles: 20,
        isDefault: false,
      },
    ];
    const query = createQueryResource({ current: locations });
    vi.mocked(listSavedLocations).mockReturnValue(query as never);
    locationStore.setDefault(locations[0]);

    render();

    const savedSection = target.querySelector('[aria-labelledby="saved-locations-heading"]')!;
    expect(savedSection.textContent).toContain('2 of 3');
    expect(savedSection.textContent).toContain('Midtown, New York');
    expect(savedSection.textContent).toContain('Default');
    expect(savedSection.textContent).toContain('Philadelphia, PA');
    expect(savedSection.textContent).toContain('Make default');
  });

  it('exposes diagnostic error details when loading fails and recovers on retry', async () => {
    const philly: SavedLocation = {
      id: 'loc-philly',
      name: 'Philadelphia, PA',
      lat: 39.9526,
      lng: -75.1652,
      radiusMiles: 20,
      isDefault: true,
    };

    const query = createQueryResource({
      current: undefined,
      error: {
        status: 502,
        body: {
          message:
            'Convex savedLocations functions are not deployed on the active backend (run `npx convex deploy`).',
        },
      },
      onRefresh: () => {
        query.error = undefined;
        query.current = [philly];
      },
    });
    vi.mocked(listSavedLocations).mockReturnValue(query as never);

    render();

    const alert = target.querySelector('.load-error[role="alert"]')!;
    expect(alert.textContent).toContain("Couldn't load your saved locations.");
    expect(alert.textContent).toContain(
      'Convex savedLocations functions are not deployed on the active backend',
    );

    const retryButton = alert.querySelector<HTMLButtonElement>('button')!;
    expect(retryButton.textContent).toContain('Try again');
    retryButton.click();
    await vi.waitFor(() => {
      flushSync();
      expect(query.refresh).toHaveBeenCalledOnce();
      expect(target.querySelector('.load-error')).toBeNull();
    });

    const savedSection = target.querySelector('[aria-labelledby="saved-locations-heading"]')!;
    expect(savedSection.textContent).toContain('Philadelphia, PA');
    expect(savedSection.textContent).toContain('Default');
  });

  it('allows saving the selected current location and marking a location as default', async () => {
    const midtown: SavedLocation = {
      id: 'loc-midtown',
      name: 'Midtown, New York',
      lat: 40.7484,
      lng: -73.9857,
      radiusMiles: 29,
      isDefault: true,
    };
    const phillySaved: SavedLocation = {
      id: 'loc-philly',
      name: 'Philadelphia, PA',
      lat: 39.9526,
      lng: -75.1652,
      radiusMiles: 29,
      isDefault: false,
    };

    let currentList: SavedLocation[] = [midtown];
    const query = createQueryResource({
      current: currentList,
      onRefresh: () => {
        query.current = [...currentList];
      },
    });
    vi.mocked(listSavedLocations).mockReturnValue(query as never);

    // User selected Philadelphia in Location section (unsaved).
    locationStore.setActive({
      name: 'Philadelphia, PA',
      center: { lat: 39.9526, lng: -75.1652 },
      radiusMiles: 29,
      savedLocationId: null,
    });

    vi.mocked(createSavedLocation).mockImplementation((() => {
      currentList = [midtown, phillySaved];
      return Promise.resolve({ success: true as const, location: phillySaved });
    }) as never);

    vi.mocked(setDefaultSavedLocation).mockImplementation((() => {
      const updatedPhilly: SavedLocation = { ...phillySaved, isDefault: true };
      currentList = [{ ...midtown, isDefault: false }, updatedPhilly];
      return Promise.resolve(updatedPhilly);
    }) as never);

    render();

    const saveForm = target.querySelector<HTMLFormElement>('.save-location-form')!;
    expect(saveForm).not.toBeNull();
    expect(saveForm.textContent).toContain('Save this location');

    saveForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => {
      flushSync();
      expect(createSavedLocation).toHaveBeenCalledWith({
        name: 'Philadelphia, PA',
        lat: 39.9526,
        lng: -75.1652,
        radiusMiles: 29,
      });
      expect(locationStore.savedLocationId).toBe('loc-philly');
    });

    // Click "Make default" on Philadelphia.
    const makeDefaultBtn = Array.from(target.querySelectorAll<HTMLButtonElement>('.saved-actions button')).find(
      (btn) => btn.textContent?.includes('Make default'),
    )!;
    expect(makeDefaultBtn).toBeDefined();
    makeDefaultBtn.click();

    await vi.waitFor(() => {
      flushSync();
      expect(setDefaultSavedLocation).toHaveBeenCalledWith('loc-philly');
      expect(target.querySelector('.location-sub')?.textContent).toContain('Default location');
    });

    const badges = target.querySelectorAll('.default-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].closest('.saved-item')?.textContent).toContain('Philadelphia, PA');
  });
});
