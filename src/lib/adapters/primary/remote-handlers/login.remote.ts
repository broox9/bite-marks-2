import { form, getRequestEvent } from "$app/server";
import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { z } from "zod";

import { authorizationUseCase as auth } from "$lib/use_cases/authorization";

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

  cookies.set(auth.getCookieName(), session.secret, {
    // use the session secret as the cookie value
    httpOnly: true,
    secure: !dev,
    sameSite: "strict",
    expires: new Date(session.expire),
    path: "/",
  });

  throw redirect(302, "/list");
});

