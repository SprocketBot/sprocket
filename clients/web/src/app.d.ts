// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
    // interface Locals {}
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
    interface Session {
        access?: string;
        refresh?: string;
    }
    interface Metadata {
        /**
         * Used to force the use of a specific access token.
         * Useful when running mutations / queries before the session updates
         */
        accessTokenOverride?: string;
    }
}
