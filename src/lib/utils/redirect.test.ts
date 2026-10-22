import { describe, expect, it } from "vitest";
import { safeRedirectTo } from "./redirect";

describe("safeRedirectTo", () => {
  it("keeps local application paths", () => {
    expect(safeRedirectTo("/p/ChIJ123?from=share")).toBe("/p/ChIJ123?from=share");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirectTo("https://example.com")).toBe("/list");
    expect(safeRedirectTo("//example.com")).toBe("/list");
  });

  it("uses the supplied fallback for missing values", () => {
    expect(safeRedirectTo(null, "/")).toBe("/");
  });
});
