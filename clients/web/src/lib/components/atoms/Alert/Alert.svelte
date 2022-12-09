<script lang="ts">
    import {fade} from "svelte/transition";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {CheckCircle, ExclamationCircle, InformationCircle, XMark} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import type {AlertVariant} from "./types";

    export let variant: AlertVariant;
    export let withIcon = true;
    export let dismissible = true;

    let iconSrc: IconSource | undefined;
    switch (variant) {
        case "info":
            iconSrc = InformationCircle;
            break;
        case "success":
            iconSrc = CheckCircle;
            break;
        case "warning":
        case "danger":
            iconSrc = ExclamationCircle;
            break;
        default:
            break;
    }

    const hasDetails = $$slots.details;
    const hasActions = $$slots.actions;

    let dismissed = false;
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
                <button
                    on:click={() => (dismissed = true)}
                    type="button"
                    class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8"
                >
                    <span class="sr-only">Close</span>
                    <Icon class="w-5 h-5" src={XMark} />
                </button>
            {/if}
        </div>

        {#if hasDetails}
            <div class="mt-2 text-sm">
                <slot name="details" />
            </div>
        {/if}

        {#if hasActions}
            <div class="mt-3">
                <slot name="actions" />
            </div>
        {/if}
    </div>
{/if}

<style lang="postcss">
    .v-info {
        @apply border-info-300 bg-info-300 text-info-900;
        button {
            @apply text-info-800 focus:ring-info-400 hover:bg-info-400/50;
        }
    }

    .v-success {
        @apply border-success-300 bg-success-300 text-success-900;
        button {
            @apply text-success-800 focus:ring-success-400 hover:bg-success-400/50;
        }
    }

    .v-warning {
        @apply border-warning-300 bg-warning-300 text-warning-900;
        button {
            @apply text-warning-800 focus:ring-warning-400 hover:bg-warning-400/50;
        }
    }

    .v-danger {
        @apply border-danger-300 bg-danger-300 text-danger-900;
        button {
            @apply text-danger-800 focus:ring-danger-400 hover:bg-danger-400/50;
        }
    }
</style>
