<script lang="ts">
import { getContext } from "svelte";
import type { Writable } from "svelte/store";
import type { BoundBox } from "../../types";


    const bounds = getContext<Writable<BoundBox>>("indicatorBounds");
</script>

<div style="top: {$bounds.y - 2}px; left: {$bounds.x - 2}px; width: {$bounds.w + 4}px; height: {$bounds.h + 4}px"/>

<style>
    div {
        position: absolute;
        border: 1px solid red;
        z-index: 100;
        pointer-events: none;
    }
</style>