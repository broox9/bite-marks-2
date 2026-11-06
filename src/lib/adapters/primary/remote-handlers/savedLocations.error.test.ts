import { describe, expect, it } from "vitest";
import { formatSavedLocationsBackendError } from "./savedLocations.error";

describe("formatSavedLocationsBackendError", () => {
  it("explains when Convex savedLocations functions are missing on the deployment", () => {
    const err = new Error(
      "[Request ID: b99c9dae8438443a] Server Error\nCould not find public function for 'savedLocations:listForUser'.\n"
    );
    expect(formatSavedLocationsBackendError(err)).toBe(
      "Convex savedLocations functions are not deployed on the active backend (run `npx convex deploy`)."
    );
  });

  it("strips Convex request id and Server Error wrappers to surface the underlying message", () => {
    const err = new Error(
      "[Request ID: b472d2044741b388] Server Error\nUncaught Error: Unauthorized\n    at requireUserId (../../src/convex/authHelpers.ts:5:18)"
    );
    expect(formatSavedLocationsBackendError(err)).toBe("Unauthorized");
  });

  it("returns a fallback message when only an opaque Server Error is present", () => {
    const err = new Error("[Request ID: bf28c8ecca919f4f] Server Error");
    expect(formatSavedLocationsBackendError(err)).toBe(
      "Saved locations service error on the active Convex backend."
    );
  });
});
