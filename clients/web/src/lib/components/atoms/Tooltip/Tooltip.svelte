<script lang="ts">
    import type {TooltipPosition} from "./types";

    export let position: TooltipPosition = "top";
    export let content: string;
    // https://svelte.dev/repl/dd6754a2ad0547c5b1c1ea37c0293fef?version=3.52.0
</script>

<div class="relative">
    <slot />

    <div class="tooltip {position}">
        {content}
    </div>
</div>

<style lang="postcss">
</style>
