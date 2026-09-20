import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GoogleMapsLoadError,
  getMapsImportLibrary,
  importMapsLibrary,
  waitForGoogleMaps,
  type GoogleMapsRoot,
} from "./maps-loader";

describe("getMapsImportLibrary", () => {
  it("returns undefined when the Maps namespace is missing", () => {
    expect(getMapsImportLibrary({})).toBeUndefined();
    expect(getMapsImportLibrary({ google: {} })).toBeUndefined();
    expect(getMapsImportLibrary({ google: { maps: {} } })).toBeUndefined();
  });

  it("returns undefined when importLibrary exists but is not a function", () => {
    const root = {
      google: { maps: { importLibrary: "places" as unknown as undefined } },
    } as GoogleMapsRoot;

    expect(getMapsImportLibrary(root)).toBeUndefined();
  });

  it("returns a bound importLibrary when the dynamic loader is present", async () => {
    const importLibrary = vi.fn(async function (
      this: { marker: string },
      library: string,
    ) {
      return { library, marker: this.marker };
    });
    const root: GoogleMapsRoot = {
      google: { maps: { importLibrary, marker: "maps" } as any },
    };

    const bound = getMapsImportLibrary(root);
    await expect(bound?.("places")).resolves.toEqual({
      library: "places",
      marker: "maps",
    });
  });
});

describe("importMapsLibrary", () => {
  it("throws a controlled error instead of TypeError when importLibrary is missing", async () => {
    const root: GoogleMapsRoot = { google: { maps: {} } };

    // Legacy Maps stub: `google.maps` exists, but importLibrary was never attached.
    // This is the BITE-MARKS-2-2C production failure mode (Safari / WebKit).
    expect(typeof root.google?.maps?.importLibrary).not.toBe("function");
    expect(() => {
      const maps = root.google!.maps as { importLibrary?: (library: string) => unknown };
      maps.importLibrary!("places");
    }).toThrow(TypeError);

    await expect(importMapsLibrary("places", root)).rejects.toBeInstanceOf(
      GoogleMapsLoadError,
    );
    await expect(importMapsLibrary("places", root)).rejects.not.toBeInstanceOf(
      TypeError,
    );
    await expect(importMapsLibrary("places", root)).rejects.toThrow(
      /importLibrary is unavailable/,
    );
  });

  it("does not call a non-function importLibrary property", async () => {
    const root = {
      google: {
        maps: {
          importLibrary: undefined,
        },
      },
    };

    await expect(importMapsLibrary("places", root)).rejects.toBeInstanceOf(
      GoogleMapsLoadError,
    );
  });

  it("loads the requested library when importLibrary is available", async () => {
    const places = { Place: class {} };
    const importLibrary = vi.fn(async (library: string) => {
      if (library === "places") return places;
      return {};
    });
    const root: GoogleMapsRoot = { google: { maps: { importLibrary } } };

    await expect(importMapsLibrary("places", root)).resolves.toBe(places);
    expect(importLibrary).toHaveBeenCalledWith("places");
  });
});

describe("app.html Maps bootstrap", () => {
  const html = readFileSync(resolve(process.cwd(), "src/app.html"), "utf8");
  const bootstrap =
    [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1])
      .find((script) => script.includes("bootstrapGoogleMaps")) ?? "";

  it("does not use the legacy libraries= + callback= script loader", () => {
    expect(html).not.toMatch(
      /maps\/api\/js\?[^"']*libraries=places[^"']*callback=resolveGoogleLoaded/,
    );
  });

  it("defines importLibrary immediately so Safari does not see an undefined function", () => {
    expect(html).toContain("maps.importLibrary = function importLibrary");
    expect(html).toContain('maps.importLibrary("core")');
  });

  it("never reads an undeclared google identifier (BITE-MARKS-2-2B)", () => {
    expect(bootstrap).toContain("window.google");
    expect(bootstrap).not.toMatch(/\bif\s*\(\s*!google\s*\)/);
    expect(bootstrap).not.toMatch(/Promise\.resolve\(\s*google\s*\)/);
  });

  it("does not throw when evaluated before Maps JS defines google", () => {
    const windowObj: {
      google?: { maps?: { importLibrary?: (...args: unknown[]) => unknown } };
      resolveGoogleLoaded?: () => Promise<unknown>;
    } = {};
    const documentStub = {
      querySelector: () => null,
      createElement: () => ({
        async: false,
        nonce: "",
        src: "",
        onerror: null as ((err: Error) => void) | null,
      }),
      head: { appendChild: () => {} },
    };
    const fn = new Function(
      "window",
      "document",
      "URLSearchParams",
      "Promise",
      "Error",
      bootstrap,
    );

    expect(() =>
      fn(windowObj, documentStub, URLSearchParams, Promise, Error),
    ).not.toThrow();
    expect(typeof windowObj.resolveGoogleLoaded).toBe("function");
    expect(typeof windowObj.google?.maps?.importLibrary).toBe("function");
    expect(() => windowObj.resolveGoogleLoaded?.()).not.toThrow();
  });
});

describe("waitForGoogleMaps", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after importLibrary appears on a previously incomplete maps stub", async () => {
    const root: GoogleMapsRoot = { google: { maps: {} } };
    const importLibrary = vi.fn(async (library: string) => {
      return { library };
    });

    const ready = waitForGoogleMaps({ root, timeoutMs: 200, pollMs: 10 });
    setTimeout(() => {
      root.google!.maps!.importLibrary = importLibrary;
    }, 20);

    await expect(ready).resolves.toBe(root.google);
    expect(importLibrary).toHaveBeenCalledWith("core");
  });

  it("rejects with GoogleMapsLoadError when importLibrary never becomes a function", async () => {
    const root: GoogleMapsRoot = { google: { maps: {} } };

    await expect(
      waitForGoogleMaps({ root, timeoutMs: 30, pollMs: 5 }),
    ).rejects.toBeInstanceOf(GoogleMapsLoadError);
  });
});
