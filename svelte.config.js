import adapter from '@sveltejs/adapter-cloudflare'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
				// Consult https://svelte.dev/docs/kit/integrations
				// for more information about preprocessors
				preprocess: vitePreprocess(),

				kit: {
								alias: {
									'$components': './src/components',
									'$convex': './src/convex',
								},
								adapter: adapter(),
								experimental: {
								 remoteFunctions: true,

								 tracing: {
									 server: true
									},

								 instrumentation: {
									 server: true
									}
								}
				},
				compilerOptions: {
								experimental: {
												async: true
								}
				}
};

export default config;