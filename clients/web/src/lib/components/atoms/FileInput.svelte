<script lang="ts">
    import FaUpload from "svelte-icons/fa/FaUpload.svelte";

    export let label: string;
    export let files: FileList;
    export let disabled: boolean | undefined = undefined;
</script>


<!-- Hide the input so we can style the label -->
<input class="sr-only" id="file-input" type="file" multiple bind:files disabled={disabled} />

<label for="file-input" class={disabled ? "disabled" : ""}>
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
