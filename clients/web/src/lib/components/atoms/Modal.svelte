<script lang="ts">
    import {Portal} from "$lib/components/abstract";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    import {setContext, onMount} from "svelte";
    import {clickOutside} from "$lib/utils";

    export let title: string;
    export let visible: boolean = false;
    export let canClickOutside: boolean =  true;
    export let id: string;
    let mounted: boolean = false;
    const close = (): void => {
        visible = false;
    };

    const handleClickOutside = (): void => {
        if (canClickOutside && mounted) close();
    };

    onMount(() => {
        mounted = true;
    });

    setContext("close", close);
</script>


<Portal>
    <input type="checkbox" class="modal-toggle" bind:checked={visible}/>

    <div class="modal w-screen h-screen" {id}>
        <div class="modal-box flex flex-col px-0" use:clickOutside={{callback: handleClickOutside}}>
            <div class="close" on:click={close}>
                <IoMdClose/>
            </div>

            <h2 class="px-4 md:px-8">{title ?? ""}</h2>

            <div class="flex-shrink overflow-y-auto px-4 md:px-8">
                <slot name="body"/>

                {#if $$slots.actions}
                    <div class="modal-action">
                        <slot name="actions" {close}/>
                    </div>
                {/if}
            </div>

        </div>
    </div>
</Portal>


<style lang="postcss">
    h2 {
        @apply text-2xl text-sprocket font-bold mb-4;
    }

    .close {
        @apply absolute top-4 right-4 text-xl h-8 rounded-full bg-base-200/20 hover:bg-base-200/40 active:bg-base-200/60 p-1
        cursor-pointer;
    }
</style>
