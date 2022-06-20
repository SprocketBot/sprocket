<script lang="ts">
    import {slide} from "svelte/transition";
    export let shown = false;
</script>

<div on:click={() => (shown = !shown)}>
    <slot name="header" {shown}/>
</div>

{#if shown}
<div transition:slide>
    <slot name="content"/>
</div>
{/if}