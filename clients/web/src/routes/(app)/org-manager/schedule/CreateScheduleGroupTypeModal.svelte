<script>
	import { CreateScheduleGroupTypeMutationStore } from '$houdini';
	import * as v from 'valibot';

	const createScheduleGroupTypeMutation = new CreateScheduleGroupTypeMutationStore();

	let name = '';
	const onSubmit = async () => {
		const nameParse = v.safeParse(v.string([v.minLength(1)]), name);
        if (!nameParse.success) {
            // TODO: Error feedback
            return
        }

		await createScheduleGroupTypeMutation.mutate({
			payload: { name: name }
		});
	};
</script>

<section class="w-modal card px-8 py-4">
	<header class="mb-6">
		<p class="text-lg font-bold">Create new Schedule Group Type</p>
	</header>
	<form on:submit|preventDefault={onSubmit} class="flex flex-col gap-2">
        <label class="label">
            Name
            <input bind:value={name} class="input text-sm my-1" />
        </label>
        <button class="btn variant-filled-success" disabled={!name}>
            Create Schedule Group Type
        </button>
    </form>
</section>
