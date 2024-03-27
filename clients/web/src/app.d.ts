// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	interface Locals {
		authToken?: string;
	}
	interface PageData {
		// You cannot use import/export at the root level, must be written this way or the file stops working
		// user: import("@sprocketbot/lib/types").User
	}
	// interface Error {}
	// interface Platform {}
}
