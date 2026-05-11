import { form, getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";
import { z } from "zod";

import { authorizationUseCase as auth } from "$lib/use_cases/authorization";
import { setAppwriteSessionCookie } from "$lib/adapters/secondary/appwrite/server-client.server";

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const loginAction = form(loginSchema, async ({ email, password }) => {
  console.log("[bs] loginRemoteHandler::login::email", email);
  console.log("[bs] loginRemoteHandler::login::password", password);
  const session = await auth.login(email, password);
  console.log("[bs] loginRemoteHandler::login::session", session);

  const { cookies } = getRequestEvent();
  setAppwriteSessionCookie(cookies, session);

  throw redirect(302, "/list");
});

