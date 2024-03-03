<script lang="ts">
  import {indicatorBounds, selectedEl} from "$src/stores";

  function onWindowResize() {
      if (!$selectedEl) {
          $indicatorBounds = {
              x: -1,
              y: -1,
              h: 0,
              w: 0,
          };
      } else {
          const rect = $selectedEl.getBoundingClientRect();

          $indicatorBounds = {
              x: rect.x,
              y: rect.y,
              w: rect.width,
              h: rect.height,
          };
      }
  }
</script>

<svelte:window on:resize={onWindowResize} />

<div
  class:hasSelection={Boolean($selectedEl)}
  style="top: {$indicatorBounds.y - 3}px; left: {$indicatorBounds.x - 3}px; width: {$indicatorBounds.w
    + 6}px; height: {$indicatorBounds.h + 6}px"
/>

<style lang="postcss">
  div {
    @apply absolute border-2 border-primary-500 z-50 pointer-events-none;
  }
  div.hasSelection {
    @apply absolute border-2 border-green-500;
  }
</style>
