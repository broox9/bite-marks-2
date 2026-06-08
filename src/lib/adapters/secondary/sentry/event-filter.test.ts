import { describe, expect, it } from "vitest";

import { isLocalHostname, isLocalUrl, shouldDropLocalSentryEvent } from "./event-filter";

describe("isLocalHostname", () => {
  it("detects localhost-style hostnames", () => {
    expect(isLocalHostname("localhost")).toBe(true);
    expect(isLocalHostname("127.0.0.1")).toBe(true);
    expect(isLocalHostname("::1")).toBe(true);
    expect(isLocalHostname("app.localhost")).toBe(true);
  });

  it("does not classify production hostnames as local", () => {
    expect(isLocalHostname("bite-marks.example")).toBe(false);
    expect(isLocalHostname("example.com")).toBe(false);
  });
});

describe("isLocalUrl", () => {
  it("detects local request URLs", () => {
    expect(isLocalUrl("http://localhost:5173/login")).toBe(true);
    expect(isLocalUrl("http://127.0.0.1:5173/login")).toBe(true);
    expect(isLocalUrl("http://[::1]:5173/login")).toBe(true);
  });

  it("allows remote URLs and ignores malformed values", () => {
    expect(isLocalUrl("https://bite-marks.example/login")).toBe(false);
    expect(isLocalUrl("not a url")).toBe(false);
    expect(isLocalUrl(undefined)).toBe(false);
  });
});

describe("shouldDropLocalSentryEvent", () => {
  it("drops events with local request URLs", () => {
    expect(
      shouldDropLocalSentryEvent({
        request: { url: "http://localhost:5173/login" },
      })
    ).toBe(true);
  });

  it("keeps events without local request URLs", () => {
    expect(
      shouldDropLocalSentryEvent({
        request: { url: "https://bite-marks.example/login" },
      })
    ).toBe(false);
    expect(shouldDropLocalSentryEvent({})).toBe(false);
  });
});
