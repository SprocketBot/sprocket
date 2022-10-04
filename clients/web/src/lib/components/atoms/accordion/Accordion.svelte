<script lang="ts">
    import { slide } from 'svelte/transition';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { ChevronDown } from '@steeze-ui/heroicons';
  
    export let open = false;
    export let flush = false;
  </script>
  
  <section class:flush>
      <button on:click={() => (open = !open)}>
          <slot name="title" />
          <span class:active={open}><Icon class="w-4 h-4" src={ChevronDown} /></span>
      </button>
      {#if open}
          <div transition:slide>
              <slot />
          </div>
      {/if}
  </section>
  
  <style lang="postcss">
      section {
  
          &:first-child button {
              @apply rounded-t-lg;
          }
  
          button {
              @apply flex justify-between items-center
              p-4 w-full
              font-medium text-left
              hover:bg-gray-800 bg-gray-700 active:bg-gray-900
              focus:ring-1 focus:ring-gray-600 text-gray-100;
  
              span {
                  &.active {
                      @apply rotate-180;
                  }
  
                  @apply transition-all;
              }
          }
  
          div {
              @apply px-8 py-4 w-full text-gray-400
              border border-gray-700 bg-gray-900;
          }
  
          /* Flush Variant */
  
          &.flush {
              button {
                  @apply rounded-none border-0 ring-0 bg-transparent;
              }
  
              div {
                  @apply bg-transparent border-0;
              }
          }
      }
  </style>