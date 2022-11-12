<script lang="ts" context="module">
    import type {Files, RejectedFile} from "filedrop-svelte";
    export type FileWithPath = Files["accepted"][number];
    export type FileInputShowDropzone = "never" | "when-dropping" | "always";
</script>

<script lang="ts">
    import {slide} from "svelte/transition";
    import {nanoid} from "nanoid";
    import {filedrop} from "filedrop-svelte";

    import type {FormControlSize, FormControlState} from "../form.types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {CloudArrowUp, DocumentText} from "@steeze-ui/heroicons";

    export let label: string;
    export let value: FileWithPath[] | undefined = undefined;
    export let multiple: boolean = false;
    export let showDropzone: FileInputShowDropzone = "when-dropping";

    export let size: FormControlSize = "md";
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;

    const labelId = `file-input_${nanoid()}`;
    const errorId = `file-input-error_${nanoid()}`;

    // Internal state
    let hasValue: boolean;
    let inputButtonText: string;
    let inputStatusText: string;
    let dropzoneStatusText: string;
    let render: "input" | "dropzone";

    // State passed to slots
    let rejectedFiles: RejectedFile[];
    let isDropping = false;

    $: inputButtonText = multiple ? "Choose Files" : "Choose File";

    // Decide what to render based on `showDropzone` and `isDropping`
    $: {
        if (showDropzone === "never") {
            render = "input";
        } else if (showDropzone === "always") {
            render = "dropzone";
        } else {
            render = isDropping ? "dropzone" : "input";
        }
    }

    // Determine status text based on `value` `multiple`
    $: {
        if (value !== undefined && value.length > 0) {
            if (multiple) {
                const numFiles = value.length;
                inputStatusText = `${numFiles} files uploaded`;
                dropzoneStatusText = `${numFiles} files uploaded`;
            } else {
                const filename = value[0].name;
                inputStatusText = filename;
                dropzoneStatusText = filename;
            }
        } else {
            inputStatusText = placeholder || "No file chosen";
            dropzoneStatusText = multiple ? "Drop files here" : "Drop file here";
        }
    }

    const onFiledrop = (e: CustomEvent<FileDropSelectEvent>): void => {
        const {accepted, rejected} = e.detail.files;
        value = accepted;
        rejectedFiles = rejected;
        isDropping = false;
    };
</script>

<div class="size-{size} state-{state}">
    <label for={labelId} class="block mb-2 text-sm font-medium text-gray-300">{label}</label>

    <div
        class="filedrop"
        class:disabled
        use:filedrop={{multiple, disabled}}
        on:filedrop={onFiledrop}
        on:filedragenter={() => (isDropping = true)}
        on:filedragleave={() => (isDropping = false)}
    >
        <!-- Hidden input only for screenreaders -->
        <input id={labelId} type="file" aria-describedby={error ? errorId : undefined} {disabled} />

        {#if render === "input"}
            <div class="custom-input">
                <!-- This is a div and not a real button because it is purely visual, screenreader users will interact with the hidden input to upload files -->
                <div class="upload-button">{inputButtonText}</div>
                <div class="status-text">{inputStatusText}</div>
            </div>
        {:else}
            <div class="dropzone w-full h-fit flex items-center justify-center border-2 border-dashed rounded-lg transition-colors pointer-events-none" class:dropping={isDropping}>
                <slot {isDropping} {rejectedFiles}>
                    <div class="flex flex-col justify-around">
                        {#if hasValue}
                            <span class="icon">
                                <Icon src={DocumentText} />
                            </span>
                            <span>{inputStatusText}</span>
                        {:else}
                            <span class="icon">
                                <Icon src={CloudArrowUp} />
                            </span>
                            <span>{dropzoneStatusText}</span>
                        {/if}
                    </div>
                </slot>
            </div>
        {/if}
    </div>

    {#if error && state === "invalid"}
        <span class="error" id={errorId} transition:slide>{error}</span>
    {/if}
</div>

<style lang="postcss">
    /* Default styling */
    .filedrop {
        @apply select-none;
    }

    .custom-input {
        @apply overflow-hidden
            flex flex-row
            border border-gray-600 rounded-lg;

        .upload-button {
            @apply bg-gray-600;
        }
    }

    .filedrop:not(.disabled) {
        @apply rounded-lg cursor-pointer focus-within:ring-1 focus-within:ring-primary focus-within:border-primary;

        .upload-button {
            @apply text-white hover:bg-gray-500;
        }

        .status-text {
            @apply bg-gray-700 text-gray-400;
        }

        .dropzone {
            @apply border-gray-500 text-gray-400;

            &.dropping {
                @apply border-primary-500 text-primary-500;
            }
        }
    }

    .filedrop.disabled {
        @apply cursor-not-allowed text-gray-400 placeholder-gray-500;

        .upload-button {
            @apply text-gray-300;
        }

        .status-text {
            @apply bg-gray-700 text-gray-500;
        }

        .dropzone {
            @apply border-gray-600 text-gray-500;
        }
    }

    /* Size styling */
    .size-sm {
        .custom-input * {
            @apply p-2 sm:text-xs;
        }

        .dropzone {
            @apply p-4 sm:text-xs;
        }
        .icon {
            @apply h-8;
        }
    }

    .size-md {
        .custom-input * {
            @apply p-2.5 text-sm;
        }
        .dropzone {
            @apply p-5 text-sm;
        }
        .icon {
            @apply h-12;
        }
    }

    .size-lg {
        .custom-input * {
            @apply p-4 sm:text-base;
        }
        .dropzone {
            @apply p-8 sm:text-base;
        }
        .icon {
            @apply h-16;
        }
    }

    /* State styling */
    .state-valid {
        label,
        .status-text {
            @apply text-success-500;
        }
        .custom-input {
            @apply bg-gray-700 border-success-500 ring-success-500;
        }
    }

    .state-invalid {
        label,
        .status-text {
            @apply text-danger-500;
        }
        .custom-input {
            @apply bg-gray-700 border-danger-500 ring-danger-500;
        }
        .error {
            @apply text-danger-500;
        }
    }
</style>
