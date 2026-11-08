// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { flushSync, mount, unmount, type ComponentProps } from "svelte";
import LocationTools from "./LocationTools.svelte";
import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";
import { searchForAreas } from "$lib/adapters/secondary/google/google.svelte";
import { MIN_RADIUS_MILES, MAX_RADIUS_MILES } from "$lib/core/domain/Location/limits";

vi.mock("$lib/adapters/secondary/google/google.svelte", () => ({ searchForAreas: vi.fn() }));

const brooklyn = {
  id: "brooklyn",
  displayName: "Brooklyn",
  formattedAddress: "Brooklyn, NY, USA",
  lat: 40.6782,
  lng: -73.9442,
};
const newark = {
  id: "newark",
  displayName: "Newark",
  formattedAddress: "Newark, NJ, USA",
  lat: 40.7357,
  lng: -74.1724,
};

type Props = ComponentProps<typeof LocationTools>;
let component: ReturnType<typeof mount>;
let target: HTMLDivElement;

function render(props: Props = {}) {
  component = mount(LocationTools, { target, props });
  flushSync();
}

function input(query: string) {
  const field = target.querySelector<HTMLInputElement>('input[type="search"]')!;
  field.value = query;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  return field;
}

function submit() {
  const event = new Event("submit", { bubbles: true, cancelable: true });
  target.querySelector("form")!.dispatchEvent(event);
  flushSync();
  return event;
}

function currentButton() {
  return target.querySelector<HTMLButtonElement>(".use-current-btn")!;
}

beforeEach(() => {
  target = document.createElement("div");
  document.body.append(target);
  locationStore.reset();
  vi.mocked(searchForAreas).mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(async () => {
  await unmount(component);
  target.remove();
  locationStore.reset();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("LocationTools", () => {
  it("renders results, selects a location and preserves the active radius", async () => {
    const onLocationChange = vi.fn();
    locationStore.setActive({
      name: "Home",
      center: { lat: 1, lng: 2 },
      radiusMiles: 7,
      savedLocationId: "saved-home",
    });
    vi.mocked(searchForAreas).mockImplementation(async (_, callback) => callback([brooklyn]));
    render({ onLocationChange });
    const field = input("Brooklyn");
    expect(submit().defaultPrevented).toBe(true);
    await vi.waitFor(() =>
      expect(target.querySelector('[role="option"]')?.textContent).toContain("Brooklyn"),
    );

    target.querySelector<HTMLElement>('[role="option"]')!.click();
    flushSync();
    expect(locationStore.snapshot).toEqual({
      name: "Brooklyn, NY, USA",
      center: { lat: brooklyn.lat, lng: brooklyn.lng },
      radiusMiles: 7,
      savedLocationId: null,
    });
    expect(onLocationChange).toHaveBeenCalledExactlyOnceWith(locationStore.snapshot);
    expect(field.value).toBe("");
    expect(target.querySelector('[role="listbox"]')).toBeNull();
  });

  it("shares the store radius and enforces the domain limits", () => {
    render();
    const slider = target.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(slider.min).toBe(String(MIN_RADIUS_MILES));
    expect(slider.max).toBe(String(MAX_RADIUS_MILES));
    expect(slider.value).toBe(String(locationStore.radiusMiles));
    slider.value = "12";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    flushSync();
    expect(locationStore.radiusMiles).toBe(12);
    expect(target.textContent).toContain("12 miles");
  });

  it("hides the heading and radius for Settings", () => {
    render({ showHeading: false, showRadius: false, showCurrentLocation: true });
    expect(target.querySelector("h3")).toBeNull();
    expect(target.querySelector('input[type="range"]')).toBeNull();
    expect(currentButton().textContent).toContain("Use current location");
  });

  it("debounces typing and discards stale results after a newer query or clearing", async () => {
    vi.useFakeTimers();
    const callbacks: Parameters<typeof searchForAreas>[1][] = [];
    vi.mocked(searchForAreas).mockImplementation(async (_, callback) => {
      callbacks.push(callback);
    });
    render();
    input("Bro");
    input("Brooklyn");
    await vi.advanceTimersByTimeAsync(250);
    expect(searchForAreas).toHaveBeenCalledTimes(1);
    input("Newark");
    await vi.advanceTimersByTimeAsync(250);
    callbacks[1]([newark]);
    callbacks[0]([brooklyn]);
    flushSync();
    expect(target.querySelector('[role="listbox"]')?.textContent).toContain("Newark");
    expect(target.querySelector('[role="listbox"]')?.textContent).not.toContain("Brooklyn");
    input("");
    callbacks[1]([newark]);
    flushSync();
    expect(target.querySelector('[role="listbox"]')).toBeNull();
    expect(target.textContent).not.toContain("Searching…");
  });

  it("shows search failures and empty results", async () => {
    vi.mocked(searchForAreas).mockRejectedValueOnce(new Error("network"));
    render();
    input("Brooklyn");
    submit();
    await vi.waitFor(() =>
      expect(target.querySelector('[role="alert"]')?.textContent).toContain("Could not search"),
    );
    vi.mocked(searchForAreas).mockImplementation(async (_, callback) => callback([]));
    submit();
    await vi.waitFor(() => expect(target.textContent).toContain("No locations found"));
    expect(target.querySelector('[role="alert"]')).toBeNull();
  });

  it("sets current location with loading feedback and calls the callback", () => {
    const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    const onLocationChange = vi.fn();
    render({ showCurrentLocation: true, onLocationChange });
    currentButton().click();
    flushSync();
    expect(currentButton().disabled).toBe(true);
    expect(currentButton().textContent).toContain("Locating…");
    getCurrentPosition.mock.calls[0][0]({
      coords: { latitude: 40.7, longitude: -74 },
    } as GeolocationPosition);
    flushSync();
    expect(locationStore.name).toBe("Current location");
    expect(locationStore.center).toEqual({ lat: 40.7, lng: -74 });
    expect(locationStore.savedLocationId).toBeNull();
    expect(onLocationChange).toHaveBeenCalledExactlyOnceWith(locationStore.snapshot);
    expect(currentButton().disabled).toBe(false);
  });

  it("keeps the active location on geolocation failure and allows retrying", () => {
    const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    const original = locationStore.snapshot;
    render({ showCurrentLocation: true });
    currentButton().click();
    getCurrentPosition.mock.calls[0][1]!({ code: 1 } as GeolocationPositionError);
    flushSync();
    expect(target.querySelector('[role="alert"]')?.textContent).toContain(
      "Could not get your location",
    );
    expect(currentButton().disabled).toBe(false);
    expect(locationStore.snapshot).toEqual(original);
    currentButton().click();
    flushSync();
    expect(target.querySelector('[role="alert"]')).toBeNull();
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it("explains when geolocation is unavailable", () => {
    vi.stubGlobal("navigator", {});
    render({ showCurrentLocation: true });
    currentButton().click();
    flushSync();
    expect(target.querySelector('[role="alert"]')?.textContent).toContain("not available");
    expect(currentButton().disabled).toBe(false);
  });

  it("does not replace a newer search selection with a pending geolocation result", async () => {
    const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    vi.mocked(searchForAreas).mockImplementation(async (_, callback) => callback([brooklyn]));
    render({ showCurrentLocation: true });
    currentButton().click();
    input("Brooklyn");
    submit();
    await vi.waitFor(() => expect(target.querySelector('[role="option"]')).not.toBeNull());
    target.querySelector<HTMLElement>('[role="option"]')!.click();
    getCurrentPosition.mock.calls[0][0]({
      coords: { latitude: 0, longitude: 0 },
    } as GeolocationPosition);
    flushSync();
    expect(locationStore.name).toBe("Brooklyn, NY, USA");
    expect(currentButton().disabled).toBe(false);
  });
});
