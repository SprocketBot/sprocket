<script lang="ts">
    import {slide} from "svelte/transition";
    export let shown = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={() => { shown = !shown }}>
    <slot name="header" {shown}/>
</div>

{#if shown}
<div transition:slide|local>
    <slot name="content"/>
</div>
{/if}
