<script lang="ts">
    import {Portal} from "$lib/components/abstract/Portal";
    import {toastStore} from "./toast.store";
    import Toast from "./Toast.svelte";
</script>

<Portal>
    <div class="fixed bottom-4 right-4 flex flex-col items-end">
        {#each $toastStore.reverse() as toast (toast.id)}
            <Toast {toast} />
        {/each}
    </div>
</Portal>
