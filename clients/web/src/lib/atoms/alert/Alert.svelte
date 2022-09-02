<script lang="ts">
  import {fade} from "svelte/transition";
  import { Icon } from '@steeze-ui/svelte-icon';
  import { X, InformationCircle, ExclamationCircle, CheckCircle } from '@steeze-ui/heroicons';

  import type { AlertVariant } from "./Alert.types";

  export let variant: AlertVariant = "info";
  export let dismissable = false;

  let dismissed = false;

  // IconSource isn't available as a type, outside the package steeze ui package it seems.
  let iconSrc: undefined | typeof InformationCircle;
  $: {
    switch(variant) {
      case "info":
        iconSrc = InformationCircle
        break
      case "warning":
      case "error":
        iconSrc = ExclamationCircle;
        break;
      case "success":
        iconSrc = CheckCircle;
        break;
    }
  }
</script>

{#if !dismissed}
    <div class="v-{variant}" role="alert" out:fade>
        {#if iconSrc}
            <Icon src={iconSrc} class="h-6 w-6"/>
        {/if}
        
        <slot/>
        
        {#if dismissable}
            <span on:click={() => dismissed = true}>
                <Icon src={X} theme="solid" />
            </span>
        {/if}
    </div>
{/if}

<style lang="postcss">
    div {
        @apply p-4 mb-4 text-sm rounded-lg relative flex justify-between items-center gap-4;
        &.v-info {
            @apply text-info-200 bg-info-800;
				}
        &.v-success {
            @apply text-success-200 bg-success-800;
        }
        &.v-warning {
            @apply text-warning-200 bg-warning-800;
        }
        &.v-error {
            @apply text-error-200 bg-error-800;
        }
    }
    span {
        @apply flex-shrink w-6 h-6 p-1 rounded-full cursor-pointer
        bg-gray-300/20 hover:bg-gray-300/30 active:bg-gray-300/50;
    }

</style>
