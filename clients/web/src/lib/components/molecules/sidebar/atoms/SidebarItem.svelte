<script lang="ts">
  import { getContext } from 'svelte';
  import { Icon } from '@steeze-ui/svelte-icon';
  import type { IconSource } from '@steeze-ui/svelte-icon/types';
  import { type SidebarContext, SidebarContextKey } from '../types';
  import { tooltip } from '../../../actions/Tooltip';

  export let icon: IconSource | undefined;
  export let label: string;

  let context = getContext<SidebarContext>(SidebarContextKey);
  console.log({ context });
</script>

<li on:click>
	<a href="#" class="flex items-center p-2 text-base font-normal rounded-lg text-white hover:bg-gray-700 group h-10"
		 use:tooltip={{content: label, position: "right", active: context.showTooltips}}>
		{#if icon}
			<Icon src={icon} class="w-6 h-6 transition duration-75 text-gray-400 group-hover:text-white" />
		{:else}
			<span class="w-6 text-center text-lg">
				{#if context.iconOnly}
					{label.charAt(0).toUpperCase()}
				{/if}
			</span>
		{/if}
		{#if !context.iconOnly}
			<span class="ml-3">{label}</span>
			<div class="flex-1 flex justify-end">
				<slot />
			</div>
		{/if}
	</a>
	<slot name="siblings" />
</li>
