<script lang="ts">
  import {
      previewEl, indicatorBounds, selectedEl, fontElements, links,
  } from "$src/stores";
  import {onDestroy, onMount} from "svelte";
  import {selectableElements} from "$utils/SvgRules";
  import Indicator from "$components/molecules/Indicator.svelte";

  let container: HTMLElement;
  export let el: SVGElement;

  onMount(async () => {
      $previewEl = el;
      container.appendChild($previewEl);

      // build out the assigned values list
      $links = new Map();
      const assignedElements = $previewEl.querySelectorAll("[data-sprocket]");
      if (assignedElements.length > 0) {
          $links = new Map();
          for (const element of assignedElements) {
              const elMap = new Map();
              $links.set(element as SVGElement, elMap);
              const elLinks = JSON.parse(element.getAttribute("data-sprocket"));
              for (const link of elLinks) {
                  elMap.set(link.type, {
                      varPath: link.varPath,
                      options: link.options,
                  });
              }
              element.removeAttribute("data-sprocket");
          }
          $links = $links;
      }

      // build out fonts list
      $fontElements = new Map();
      const fontDef = $previewEl.querySelector("def#fonts");
      if (fontDef) {
          for (const font of fontDef?.children ?? []) {
              $fontElements.set(font.getAttribute("data-font-name"), font);
          }
          fontDef.remove();
      }
      $fontElements = $fontElements;

      attachListeners($previewEl);

  });
  onDestroy(() => {
      $previewEl = undefined;
  });

  function handleMouseEnter(e: MouseEvent) {
      if ($selectedEl) return;
      if (!(e.target instanceof Element)) return;

      const element: Element = e.target;

      const rect = element.getBoundingClientRect();

      $indicatorBounds = {
          x: rect.x,
          y: rect.y,
          w: rect.width,
          h: rect.height,
      };
  }

  function attachListeners(element: SVGElement) {
      if (selectableElements.includes(element.nodeName)) {
          element.onmouseenter = handleMouseEnter;
      }
      Array.from(element.children).forEach(e => {
          if (e instanceof SVGElement) {
              attachListeners(e);
          }
      });
  }



  function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
          $selectedEl = undefined;
          $indicatorBounds = {
              x: 0, y: 0, h: 0, w: 0,
          };
      }
  }

  function handleDoubleClick(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      if (!$previewEl.contains(e.target)) return;

      let target: Element = e.target;
      if (!selectableElements.includes(target.nodeName)) {
          while (
              !selectableElements.includes(target.nodeName)
        && $previewEl.contains(target)
          ) {
              target = target.parentElement;
          }
          if (!$previewEl.contains(e.target)) return;
      }

      if (!(target instanceof SVGElement)) return;

      const rect = target.getBoundingClientRect();

      $indicatorBounds = {
          x: rect.x,
          y: rect.y,
          w: rect.width,
          h: rect.height,
      };

      $selectedEl = target;
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div bind:this={container} on:dblclick={handleDoubleClick}>
  <Indicator />
</div>

<style lang="postcss">
  div {
    @apply h-full w-full p-8 flex justify-center align-middle relative;
  }
  div :global(svg) {
    @apply h-full w-auto select-none;
  }
</style>
