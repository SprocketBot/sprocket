<script lang="ts" context="module">
    export type AlertVariant = "info" | "success" | "warning" | "error";
</script>

<script lang="ts">
    import {fade} from "svelte/transition";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { CheckCircle, ExclamationCircle, InformationCircle, XMark } from "@steeze-ui/heroicons";
    import type { IconSource } from "@steeze-ui/svelte-icon/types";

    export let variant: AlertVariant;
    export let withIcon = true;
    export let dismissible = true;

    let iconSrc: IconSource | undefined;
    switch (variant) {
        case "info":
            iconSrc = InformationCircle
            break;
        case "success":
            iconSrc = CheckCircle
            break;
        case "warning":
        case "error":
            iconSrc = ExclamationCircle
            break;
        default:
            break;
    }

    const hasDetails = $$slots.details

    let dismissed = false
</script>


<!-- https://flowbite.com/docs/components/alerts/ -->
{#if !dismissed}
    <div role="alert" class="v-{variant} p-4 mb-4 border rounded-lg" out:fade>
        <div class="flex items-center">
            {#if withIcon && iconSrc}
                <Icon class="w-5 h-5 mr-2 flex-shrink-0" src={iconSrc} />
            {/if}

            <span class="sr-only">{variant}</span>

            <!-- Bolder, larger font if details are being used -->
            <h3 class:text-lg={hasDetails} class:font-medium={hasDetails} class:text-sm={!hasDetails}>
                <slot />
            </h3>

            {#if dismissible}
                <button on:click={() => dismissed = true} type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8">
                    <span class="sr-only">Close</span>
                    <Icon class="w-5 h-5" src={XMark} />
                </button>
            {/if}
        </div>

        {#if $$slots.details}
            <div class="mt-2 text-sm">
                <slot name="details" />
            </div>
        {/if}

        <slot name="actions" />
    </div>
{/if}


<style lang="postcss">
    .v-info {
        @apply border-blue-300 bg-blue-300 text-blue-900;
        button { @apply text-blue-800 focus:ring-blue-400 hover:bg-blue-400/50; }
    }
    
    .v-success {
        @apply border-green-300 bg-green-300 text-green-900;
        button { @apply text-green-800 focus:ring-green-400 hover:bg-green-400/50; }
    }

    .v-warning {
        @apply border-orange-300 bg-orange-300 text-orange-900;
        button { @apply text-orange-800 focus:ring-orange-400 hover:bg-orange-400/50; }
    }

    .v-error {
        @apply border-red-300 bg-red-300 text-red-900;
        button { @apply text-red-800 focus:ring-red-400 hover:bg-red-400/50; }
    }
</style>