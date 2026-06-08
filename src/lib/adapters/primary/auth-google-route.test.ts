import { beforeEach, describe, expect, it, vi } from "vitest";

const publicEnv = vi.hoisted(() => ({ PUBLIC_APP_URL: "" }));
const getGoogleOAuthRedirectUrl = vi.hoisted(() => vi.fn());

vi.mock("$env/dynamic/public", () => ({
  env: publicEnv,
}));

vi.mock("$lib/use_cases/authorization", () => ({
  authorizationUseCase: {
    getGoogleOAuthRedirectUrl,
  },
}));

import { GET } from "../../../routes/auth/google/+server";

function createEvent(url = "https://app.example.test/auth/google") {
  return { url: new URL(url) } as Parameters<typeof GET>[0];
}

describe("GET /auth/google", () => {
  beforeEach(() => {
    publicEnv.PUBLIC_APP_URL = "";
    getGoogleOAuthRedirectUrl.mockReset();
  });

  it("redirects to the Appwrite OAuth URL", async () => {
    getGoogleOAuthRedirectUrl.mockResolvedValue("https://appwrite.example.test/oauth");

    await expect(GET(createEvent())).rejects.toMatchObject({
      status: 302,
      location: "https://appwrite.example.test/oauth",
    });
    expect(getGoogleOAuthRedirectUrl).toHaveBeenCalledWith(
      "https://app.example.test/auth/google/callback",
      "https://app.example.test/login?oauth=error",
    );
  });

  it("redirects back to login when Appwrite rejects the OAuth redirect", async () => {
    getGoogleOAuthRedirectUrl.mockRejectedValue(new Error("OAuth redirect rejected"));

    await expect(GET(createEvent())).rejects.toMatchObject({
      status: 303,
      location: "/login?oauth=error",
    });
  });
});
