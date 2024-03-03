<script lang="ts">
  import {
      selectedEl, indicatorBounds, imageType,
  } from "$src/stores";
  import {
      applicableOperations,
      friendlyLookup,
      variableForOperation,
  } from "$utils/SvgRules";
  import DataItem from "$components/molecules/DataItem.svelte";

  function getRelevantItems(el: SVGElement, t = {}) {
      const subTemplate = {};
      for (const item of Object.keys(t)) {
          if (item === "description") {
              subTemplate[item] = t[item];
              continue;
          }

          if (Object.prototype.hasOwnProperty.call(t[item], "type")) {
              // item is a leaf element. Check if it can be applied to element and add it to subtemplate
              if (
                  applicableOperations[el.nodeName]
                      .map(x => variableForOperation[x])
                      .includes(t[item].type)
              ) {
                  subTemplate[item] = t[item];
              }
          } else {
              // not a leaf item, add children and recusively search down the tree
              subTemplate[item] = getRelevantItems(el, t[item]);
          }
      }
      // remove any children without children
      for (const item of Object.keys(subTemplate)) {
          if (Object.keys(subTemplate[item]).length === 0) {
              delete subTemplate[item];
          }
      }
      return subTemplate;
  }

  function handleClick() {
      $indicatorBounds = {
          x: 0, y: 0, w: 0, h: 0,
      };
      $selectedEl = undefined;
  }
</script>

<section>
  {#if $selectedEl}
    <header>
      <h3>
        Editing Element: 
          <strong>
            {$selectedEl.id
            || friendlyLookup[$selectedEl.tagName]
            || $selectedEl.tagName}
          </strong>
      </h3>
      <button on:click={handleClick}>Unselect Element (Esc)</button>
    </header>
    <DataItem
      item={getRelevantItems($selectedEl, $imageType.templateStructure)}
    />
  {/if}
</section>

<style lang="postcss">
  section {
    @apply px-4 py-4 max-w-full w-full select-none;
  }
  header {
    @apply flex justify-between mb-4;
  }
  h3 {
    @apply text-lg;
  }
  button {
    @apply px-2 py-1 bg-primary-500 hover:bg-primary-600 text-sproc_dark_gray-500;
  }
</style>
