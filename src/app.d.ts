// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Better Auth JWT from the session cookie (set in hooks.server.ts). */
			token: string | undefined;
			/**
			 * Current Better Auth user when authenticated (set in +layout.server.ts).
			 * Shape matches authComponent.getAuthUser / Better Auth user.
			 */
			user: { id: string; email?: string | null; name?: string | null } | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
