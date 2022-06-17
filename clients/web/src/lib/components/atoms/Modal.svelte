<script lang="ts">
    import {Portal} from "$lib/components/abstract";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    import {setContext} from "svelte";
    import {clickOutside} from "$lib/utils";

    export let title: string;
    export let visible: boolean = false;
    export let id: string;
    const close = (): void => {
        visible = false;
    };

    const handleClickOutside = (): void => {
        visible = false;
    };

    setContext("close", close);
</script>

<Portal>
    <input type="checkbox" class="modal-toggle" bind:checked={visible}/>

    <div class="modal bg-gray-700/40" {id} >
        <div class="modal-box max-w-xl" visible={visible} use:clickOutside on:outclick={handleClickOutside}>
            <div class="close" on:click={close}>
                <IoMdClose/>
            </div>
            <h2>
                {title ?? ""}
            </h2>
            <slot name="body"/>
            {#if $$slots.actions}
                <div class="modal-action">
                    <slot name="actions" {close}/>
                </div>
            {/if}
        </div>
    </div>
</Portal>

<style lang="postcss">
    h2 {
        @apply text-sprocket font-bold mb-4;
    }


    .close {
        @apply absolute top-4 right-4 text-xl h-8 rounded-full bg-base-200/20 hover:bg-base-200/40 active:bg-base-200/60 p-1
        cursor-pointer;
    }

    h2 {
        @apply text-2xl;
    }
</style>
