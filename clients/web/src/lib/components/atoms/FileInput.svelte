<script lang="ts" context="module">
    export type RemovableFile = File & {
        /** Removes this file from the list of files */
        remove: () => void;
    };

    /**
     * HTMLInputElement expects `files` to be a `FileList`, but those are immutable and a pain to work with
     * We generally work with a `File[]`, and this function can be used to give back a `FileList[]` when using on:change/value
     */
    export const filesToFileList = (files: File[]): FileList => {
        const _files = [...files] as unknown as FileList;
        _files.item = (index: number) => files[index] ?? null;
        return _files;
    };
</script>

<script lang="ts">
    import FaUpload from "svelte-icons/fa/FaUpload.svelte";
    import type svelte from "svelte";

    export let label: string;
    export let files: RemovableFile[] = [];
    export let disabled: boolean | undefined = undefined;
    export let unique = true;

    const onRemove = (file: File): void => {
        files = files.filter(f => f.name !== file.name);
    };

    const onChange: svelte.JSX.ChangeEventHandler<HTMLInputElement> = e => {
        const currentValue = [...files];
        let newValue = Array.from((e.target as HTMLInputElement).files ?? []);

        // Filter out duplicate files by name
        if (unique) {
            newValue = [...currentValue, ...newValue].reduce<File[]>((acc: File[], v: File) => {
                if (!acc.some(c => c.name === v.name)) acc.push(v);
                return acc;
            }, []);
        }

        // Add remove callbacks
        files = newValue.map(f => {
            (f as RemovableFile).remove = () => { onRemove(f) };
            return f;
        }) as RemovableFile[];
    };
</script>


<!-- Hide the input so we can style the label -->
<input class="sr-only" id="file-input" type="file" multiple files={filesToFileList(files)} on:change={onChange} disabled={disabled} />

<label for="file-input" class:disabled>
    <span><FaUpload /></span>
    {label}
</label>


<style lang="postcss">
    label {
        @apply flex flex-row w-fit gap-3 btn;

        &.disabled { @apply cursor-not-allowed btn-disabled; }

        span { @apply w-6 h-6; }
    }
</style>
