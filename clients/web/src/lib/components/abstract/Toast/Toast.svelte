<script lang="ts">
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {CheckCircle, ExclamationCircle, InformationCircle, XMark} from "@steeze-ui/heroicons";
    import {fly} from "svelte/transition";

    import {ToastStatus, type IToast} from "./types";
    import ToastProgress from "./ToastProgress.svelte";
    import {removeToast} from "./toast.store";

    export let toast: IToast;

    let iconSrc: IconSource;
    if (toast.icon) iconSrc = toast.icon;
    else
        switch (toast.status) {
            case ToastStatus.Success:
                iconSrc = CheckCircle;
                break;
            case ToastStatus.Danger:
            case ToastStatus.Warning:
                iconSrc = ExclamationCircle;
                break;
            default:
                iconSrc = InformationCircle;
                break;
        }
</script>

<div
    transition:fly={{x: 50}}
    class:pb-5={toast.ttl}
    class="inline-flex items-start p-4 max-w-xs rounded-lg shadow text-gray-400 bg-gray-800 mt-2"
    role="alert"
>
    <div class="icon {toast.status}">
        <Icon class="h-5 w-5" src={iconSrc} />
    </div>
    <div class="mx-3 text-sm font-normal">{toast.content}</div>
    {#if toast.dismissable}
        <button
            type="button"
            class="ml-auto rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700"
            on:click={() => removeToast(toast.id)}
        >
            <span class="sr-only">Close</span>
            <Icon class="h-5 w-5" src={XMark} />
        </button>
    {/if}
    {#if toast.ttl}
        <ToastProgress {toast} />
    {/if}
</div>

<style lang="postcss">
    .icon {
        @apply inline-flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg;

        &.info {
            @apply bg-info-800 text-info-200;
        }
        &.success {
            @apply bg-success-800 text-success-200;
        }
        &.warning {
            @apply bg-warning-800 text-info-200;
        }
        &.danger {
            @apply bg-danger-800 text-danger-200;
        }
    }
</style>
