<script lang="ts">
    import cookies from "js-cookie";
    import FaExclamationTriangle from "svelte-icons/fa/FaExclamationTriangle.svelte";
    import MdClose from "svelte-icons/md/MdClose.svelte";

    import {session} from "$app/stores";

    const BANNER_DISABLED_COOKIE = "sprocket.disable-stack-banner";

    let open = cookies.get(BANNER_DISABLED_COOKIE) !== "true";

    const stack = $session.config.stack;
    const prodUrl = "app.sprocket.gg";

    let showBanner: boolean;
    $: showBanner = open && (stack === "dev" || stack === "staging");

    const close = (): void => {
        open = false;
        // Set cookie that expires in one day
        cookies.set(BANNER_DISABLED_COOKIE, "true", {expires: 1});
    };
</script>

{#if showBanner}
    <div
        class="flex flex-row items-center justify-center gap-16 p-2 bg-red-600 text-white font-bold"
    >
        <span class="h-8">
            <FaExclamationTriangle />
        </span>
        <div class="flex flex-col items-center justify-center">
            <span>This is not the public Sprocket site!</span>
            <span
                >You are probably looking for <a
                    class="underline hover:text-white/90"
                    href={`https://${prodUrl}`}>{prodUrl}</a
                ></span
            >
        </div>
        <span class="h-8">
            <FaExclamationTriangle />
        </span>

        <span
            class="absolute right-8 h-8 hover:cursor-pointer"
            on:click={close}
        >
            <MdClose />
        </span>
    </div>
{/if}
