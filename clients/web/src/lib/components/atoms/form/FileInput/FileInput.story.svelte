<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Props} from "../../../../histoire";
    import type {FormControlState, FormControlSize} from "../form.types";
    import FileInput, {type FileInputShowDropzone} from "./FileInput.svelte";

    export let Hst: _Hst;

    const sizes: FormControlSize[] = ["sm", "md", "lg"];
    const states: FormControlState[] = ["none", "valid", "invalid"];
    const showDropzoneOptions: FileInputShowDropzone[] = ["when-dropping", "always", "never"];

    let label = "Replays";
    let multiple: boolean;

    let showDropzone: FileInputShowDropzone = "when-dropping";
    let size: FormControlSize = "md";
    let placeholder = "";
    let disabled = false;
    let state: FormControlState = "none";
    let error = "";
</script>

<Hst.Story title="Atoms/Form/FileInput" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Checkbox title="Multiple" bind:value={multiple} />
        <Hst.Select title="Show Dropzone" bind:value={showDropzone} options={showDropzoneOptions} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />

        <Props props={{label, showDropzone, size, placeholder, disabled, state, error}} />
    </svelte:fragment>

    <Hst.Variant title="Single File" {label} {multiple} {showDropzone} {size} {placeholder} {disabled} {state} {error}>
        <FileInput {label} {multiple} {showDropzone} {size} {placeholder} {disabled} {state} {error} />
    </Hst.Variant>

    <Hst.Variant
        title="With Dropzone Slot"
        {label}
        {multiple}
        {showDropzone}
        {size}
        {placeholder}
        {disabled}
        {state}
        {error}
    >
        <FileInput let:isDropping {label} {multiple} {showDropzone} {size} {placeholder} {disabled} {state} {error}>
            <div class="custom-dropzone" class:dropping={isDropping}>Gimme yo files</div>
        </FileInput>
    </Hst.Variant>
</Hst.Story>

<style lang="postcss">
    .custom-dropzone {
        @apply w-full h-10
            flex items-center justify-center
            border border-dashed border-gray-300 rounded-lg
            text-gray-300
            p-8
            transition-colors;

        &.dropping {
            @apply border-accent-500 text-accent-500;
        }
    }
</style>
