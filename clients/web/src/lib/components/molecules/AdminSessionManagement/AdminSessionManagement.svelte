<script lang="ts">
    import { session } from "$app/stores";
    import { apiUrl } from "$lib/utils";

    let loading = false;
    let message = "";
    let error = "";
    let userIdToLogout = "";

    // Get the API URL from the session config - use the same gqlUrl as other API calls
    $: coreUrl = $session.config?.client ? apiUrl($session.config.client, "") : "https://sprocket.mlesports.gg";

    async function handleLogoutAll() {
        if (!confirm("Are you sure you want to force-logout ALL users? This will invalidate everyone's session.")) {
            return;
        }

        loading = true;
        error = "";
        message = "";

        try {
            const token = $session.token;
            const response = await fetch(`${coreUrl}/admin/invalidate-all-sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                message = `All sessions invalidated. New token version: ${data.newTokenVersion}`;
            } else {
                error = "Failed to invalidate sessions: " + response.statusText;
            }
        } catch (e) {
            error = "Error: " + (e as Error).message;
        } finally {
            loading = false;
        }
    }

    async function handleLogoutUser() {
        if (!userIdToLogout) {
            error = "Please enter a user ID";
            return;
        }

        const userId = parseInt(userIdToLogout, 10);
        if (isNaN(userId)) {
            error = "Invalid user ID";
            return;
        }

        loading = true;
        error = "";
        message = "";

        try {
            const token = $session.token;
            const response = await fetch(`${coreUrl}/admin/invalidate-user-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                const data = await response.json();
                message = `Session invalidated for user ${userId}. New token version: ${data.newTokenVersion}`;
            } else {
                error = "Failed to invalidate user session: " + response.statusText;
            }
        } catch (e) {
            error = "Error: " + (e as Error).message;
        } finally {
            loading = false;
            userIdToLogout = "";
        }
    }
</script>

<div class="admin-session-management">
    <div class="section">
        <h3 class="text-lg font-semibold mb-2">Force Logout All Users</h3>
        <p class="text-sm text-base-content/70 mb-4">
            This will invalidate all active sessions. All users will be logged out and will need to log in again.
        </p>
        <button
            class="btn btn-warning"
            on:click={handleLogoutAll}
            disabled={loading}
        >
            {#if loading}
                <span class="loading loading-spinner"></span>
            {:else}
                Force Logout All
            {/if}
        </button>
    </div>

    <div class="divider"></div>

    <div class="section">
        <h3 class="text-lg font-semibold mb-2">Force Logout Specific User</h3>
        <p class="text-sm text-base-content/70 mb-4">
            Enter a user ID to invalidate their session.
        </p>
        <div class="flex gap-2">
            <input
                type="number"
                class="input input-bordered flex-1"
                placeholder="User ID"
                bind:value={userIdToLogout}
                disabled={loading}
            />
            <button
                class="btn btn-warning"
                on:click={handleLogoutUser}
                disabled={loading || !userIdToLogout}
            >
                Logout User
            </button>
        </div>
    </div>

    {#if message}
        <div class="alert alert-success">
            <span>{message}</span>
        </div>
    {/if}

    {#if error}
        <div class="alert alert-error">
            <span>{error}</span>
        </div>
    {/if}
</div>

<style>
    .admin-session-management {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .section {
        padding: 0.5rem 0;
    }

    .divider {
        height: 1px;
        background-color: oklch(var(--b3));
        margin: 0.5rem 0;
    }
</style>
