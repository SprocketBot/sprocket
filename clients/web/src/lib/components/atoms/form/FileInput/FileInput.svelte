<script lang="ts" context="module">
    import type {Files, RejectedFile} from "filedrop-svelte";
    export type FileWithPath = Files["accepted"][number];
    export type FileInputShowDropzone = "never" | "when-dropping" | "always";
</script>

<script lang="ts">
    import {Button} from "$lib/components";
    import {slide} from "svelte/transition";
    import {nanoid} from "nanoid";
    import {filedrop, type FileDropSelectEvent} from "filedrop-svelte";
    import type {RemovableFile} from "../form.types";

    import type {FormControlSize, FormControlState} from "../form.types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {CloudArrowUp, DocumentText} from "@steeze-ui/heroicons";

    export let label: string;
    export let value: FileWithPath[] | undefined = undefined;
    export let multiple = false;
    export let showDropzone: FileInputShowDropzone = "when-dropping";

    export let size: FormControlSize = "md";
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
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
    
    const onRemove = (file: File): void => {
        if (value) {
            value = value.filter(f => f.name !== file.name);
        }
    };

    const onChange = e => {
        const currentValue = value;
        let newValue = Array.from((e.target as HTMLInputElement).files ?? []) as FileWithPath[];

        // Filter out duplicate files by name
        const temp = currentValue? newValue.concat(currentValue) : newValue;
        newValue = temp.reduce<File[]>((acc: File[], v: File) => {
            if (!acc.some(c => c.name === v.name)) acc.push(v);
            return acc;
        }, []);

        // Add remove callbacks
        value = newValue.map(f => {
            (f as RemovableFile).remove = () => { onRemove(f) };
            return f;
        }) as RemovableFile[];
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
        <input id={labelId} type="file" aria-describedby={error ? errorId :
        undefined} {disabled} on:change={onChange} />

        {#if render === "input"}
            <div class="wrapper">
                    <!-- This is a div and not a real button because it is purely visual, screenreader users will interact with the hidden input to upload files -->
                    <Button variant="primary" size="sm"><div slot="body">{inputButtonText}</div></Button>
                    <div class="status-text">{inputStatusText}</div>
            </div>
        {:else}
            <div
                class="dropzone w-full h-fit flex items-center justify-center border-2 border-dashed rounded-lg transition-colors pointer-events-none"
                class:dropping={isDropping}
            >
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
    .wrapper {
        @apply
        flex flex-row items-center justify-between
        gap-4 px-4 py-3
        rounded-lg shadow-md;
    }
</style>