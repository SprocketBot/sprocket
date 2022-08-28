<script lang="ts">
    import {goto} from "$app/navigation";
    import {Avatar} from "$lib/components";
    import {user} from "$lib/stores/user";

    import FaSignOutAlt from "svelte-icons/fa/FaSignOutAlt.svelte";
</script>

<div class="flex justify-between items-start">
    <img src="/img/logo-horizontal.svg" alt="Sprocket" class="w-full"/>

</div>

<section class="flex flex-col">
    <!-- TODO: User Data -->
    <Avatar class="w-1/4"/>

    <div>
        <!-- {#if $user} -->
            <h2>Hello Test <!--{$user.username} -->!</h2>
        <!-- {/if} -->
    </div>

    <button class="btn btn-outline btn-error" on:click={async () => goto("/auth/logout")}>
        <span class="icon"><FaSignOutAlt/></span> Logout
    </button>


</section>

<style lang="postcss">

    img {
        @apply mb-4;
    }

    section {
        @apply p-4 flex gap-4 items-center justify-center;

        div {
            @apply text-center flex flex-col justify-center items-center;

            h2 {
                @apply font-semibold leading-none mb-2;
            }

            span {
                @apply text-sm font-light leading-none;
            }
        }
    }

    .icon {
        @apply block w-4 h-4 mx-2;
    }
</style>
