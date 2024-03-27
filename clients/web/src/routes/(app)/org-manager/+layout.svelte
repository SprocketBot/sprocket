<script lang="ts">
	import { House, Toolbox, User, Users } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
</script>

<section class="grid grid-cols-12 gap-8 px-12 py-8">
	<div class="col-span-8 row-span-2 card p-4">
		<slot />
	</div>

	<div class="col-span-4 card py-4">
		<div class="px-4">
			<div class="flex flex-col gap-2">
				<h3 class="flex justify-center gap-2 items-center text-lg">
					<Icon src={Toolbox} class="h-6 w-auto" /> Toolbox
				</h3>
				<a href="/org-manager" class="contents">
					<button class="btn variant-soft-primary btn-sm flex justify-center gap-2 items-center">
						<Icon src={House} class="h-4 w-auto" />
						Organization Dashboard
					</button>
				</a>
				<a href="/org-manager/users" class="contents">
					<button class="btn variant-soft-primary btn-sm flex justify-center gap-2 items-center">
						<Icon src={User} class="h-4 w-auto" />
						Manage Users
					</button>
				</a>
				<a href="/org-manager/roles" class="contents">
					<button class="btn variant-soft-primary btn-sm flex justify-center gap-2 items-center">
						<Icon src={Users} class="h-4 w-auto" />
						Manage Roles
					</button>
				</a>
			</div>
		</div>
	</div>
	<div class="col-span-4 card"></div>
</section>
