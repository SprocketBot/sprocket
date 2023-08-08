<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
    import {Spinner} from "$lib/components";

    export let filename: string;
    export let canRemove: boolean;
    export let loading: boolean = false;

    const dispatch = createEventDispatcher();
</script>

<div class="wrapper">
    <div class="upload">
        {#if filename}
            <span class="filename">{filename}</span>
        {/if}
        {#if loading}
            <span class="h-8">
                <Spinner/>
            </span>
        {/if}
    </div>
    <button on:click={() => dispatch("remove")} disabled={!canRemove}>
        <div class="icon">
            <IoMdClose/>
        </div>
        <span class="sr-only">Remove</span>
    </button>
</div>