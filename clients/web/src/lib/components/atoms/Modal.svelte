<script lang="ts">
    import {Portal} from "$lib/components/abstract";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    import {setContext, onMount} from "svelte";
    import {clickOutside} from "$lib/utils";

    export let title: string;
    export let visible: boolean = false;
    export let canClickOutside: boolean =  true;
    export let id: string;
    export let size: "sm" | "md" | "lg" | "xl" | "full" = "md";
    let mounted: boolean = false;

    $: sizeClass = {
        sm: "w-[min(92vw,28rem)]",
        md: "w-[min(94vw,42rem)]",
        lg: "w-[min(95vw,64rem)]",
        xl: "w-[min(96vw,84rem)]",
        full: "w-[98vw] h-[92vh]",
    }[size];

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
        <div
            class={`modal-box max-w-none max-h-[92vh] flex flex-col px-0 ${sizeClass}`}
            use:clickOutside={{callback: handleClickOutside}}
        >
            <div class="close" on:click={close}>
                <IoMdClose/>
            </div>

            <h2 class="px-4 md:px-8">{title ?? ""}</h2>

            <div class="flex-shrink min-w-0 overflow-y-auto overflow-x-hidden px-4 md:px-8">
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
