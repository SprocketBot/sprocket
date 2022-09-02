<script lang='ts'>
  import {Avatar, Dropdown} from "$lib/components";
  import {user} from "$lib/stores";
  import {goto} from "$app/navigation";
  import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";

  const actions = [ {
      label: "Sign Out",
      action: async () => goto("/auth/logout"),
} ];

</script>

{#if $user}
	<div class="flex items-center gap-8">
		<Dropdown class="dropdown-handle" items={actions}>
			<button class="btn btn-ghost btn-sm" slot="handle">
				{$user.username}
				<span class="h-4 ml-2 dropdown-icon"><FaChevronDown/></span>
			</button>
		</Dropdown>

		<Avatar class="h-12 w-12 mr-4"/>
	</div>
{:else}
	<button class='btn btn-outline' on:click={async () => goto("/auth/login")}>Sign In</button>
{/if}


<style lang="postcss">
    .dropdown-icon {
        @apply transition-all duration-300;
    }
	:global(.dropdown-handle):focus-within
	.dropdown-icon {
              @apply rotate-180;
		}

</style>
