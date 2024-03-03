<script lang="ts">
  import type {OptionType, SVGProperty} from "src/types";
import {onMount} from "svelte";
  import {links} from "$src/stores";
  import DropdownButton from "$components/atoms/DropdownButton.svelte";

  export let el: SVGElement;
  export let property: SVGProperty;
  export let option: OptionType;
  let selection = $links.get(el).get(property)?.options[option.name] || option.default;

  function updateOption(event) {
      const currentProperty = $links.get(el).get(property);
      const newOptions = {...currentProperty.options};
      newOptions[option.name] = event.detail;
      $links.get(el).set(property, {
          ...currentProperty,
          options: newOptions,
      });
      selection = event.detail;
  }

  onMount(async () => {
      if (!$links.get(el).get(property).options[option.name]) {
          updateOption({detail: option.default});
      }
  });
  
</script>

{option.displayName}

<DropdownButton bind:name={selection} choices={option.options} on:clicked={updateOption}/>