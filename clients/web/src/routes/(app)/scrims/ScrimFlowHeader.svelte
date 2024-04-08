<script lang="ts">
	import { ScrimState, type ScrimFlow_Fragment$data } from '$houdini';

	export let scrim: NonNullable<ScrimFlow_Fragment$data>;
</script>

<div class="flex justify-around items-center mb-8">
	<p
		class:bg-primary-600={scrim.state === ScrimState.PENDING}
		class:block={scrim.state === ScrimState.PENDING}
		class:hidden={scrim.state !== ScrimState.PENDING}
		class:text-surface-900={scrim.state === ScrimState.PENDING}
		class="px-4 py-2 md:block"
	>
		Pending
	</p>
	<hr class="flex-1 !hidden md:!block"  />
	<p
		class:bg-primary-600={scrim.state === ScrimState.POPPED}
		class:block={scrim.state === ScrimState.POPPED}
		class:hidden={scrim.state !== ScrimState.POPPED}
		class:text-surface-900={scrim.state === ScrimState.POPPED}
		class="px-4 py-2 md:block"
	>
		Check In
	</p>
	<hr class="flex-1 !hidden md:!block" />
	<p
		class:bg-primary-600={scrim.state === ScrimState.POPPED}
		class:block={scrim.state === ScrimState.POPPED}
		class:hidden={scrim.state !== ScrimState.POPPED}
		class:text-surface-900={scrim.state === ScrimState.POPPED}
		class="px-4 py-2 md:block"
	>
		Submit Replays
	</p>
	<hr class="flex-1 !hidden md:!block" />
	<p
		class:bg-primary-600={scrim.state === ScrimState.POPPED}
		class:block={scrim.state === ScrimState.POPPED}
		class:hidden={scrim.state !== ScrimState.POPPED}
		class:text-surface-900={scrim.state === ScrimState.POPPED}
		class="px-4 py-2 md:block"
	>
		Confirm Results
	</p>
</div>
