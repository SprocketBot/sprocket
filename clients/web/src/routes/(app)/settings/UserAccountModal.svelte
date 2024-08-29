<script lang="ts">
	import LoginButtons from '../../(auth)/LoginButtons.svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
	export let parent: { onClose: CallableFunction };
    const toastStore = getToastStore()

    function onAccountLinked() {
        toastStore.trigger({
            message: "Account Linked!",
            autohide: true,
            classes: "variant-filled-success"
        })
        parent.onClose();
    }
</script>

<section class="w-modal card px-8 py-4">
	<header>
		<p class="text-lg font-bold">Report a new Account</p>
		<LoginButtons callback={onAccountLinked} />
	</header>
</section>
