<script lang="ts">
    import {fly} from "svelte/transition";
    import {ToastStatus, type IToast} from "./types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {CheckCircle, ExclamationCircle, InformationCircle, XMark} from "@steeze-ui/heroicons";
    import {removeToast} from "./toast.store";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";

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
    class="flex items-start p-4 w-full max-w-xs rounded-lg shadow text-gray-400 bg-gray-800 mt-2"
    role="alert"
>
    <div class="icon {toast.status}">
        <span class="h-5 w-5">
            <Icon src={iconSrc} />
        </span>
    </div>
    <div class="mx-3 text-sm font-normal">{toast.content}</div>
    {#if toast.dismissable}
        <button type="button" class="close" on:click={() => removeToast(toast.id)}>
            <span class="sr-only">Close</span>
            <span class="h-5 w-5">
                <Icon src={XMark} />
            </span>
        </button>
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

    .close {
        @apply ml-auto rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700;
    }
</style>
