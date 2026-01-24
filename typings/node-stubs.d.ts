// Minimal Node type stubs so `svelte-check` can run without `@types/node`.

declare const process: {
	env: Record<string, string | undefined>;
	cwd(): string;
};

declare module "crypto" {
	export function randomUUID(): string;
}

declare module "fs/promises" {
	export function readFile(path: string, options?: any): Promise<any>;
	export function writeFile(path: string, data: any, options?: any): Promise<void>;
}

declare module "path" {
	export function join(...parts: string[]): string;
}

