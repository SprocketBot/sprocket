<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {addToast} from "./toast.store";
    import ToastContainer from "./ToastContainer.svelte";
    import {ToastStatus} from "./types";
    import {PaperAirplane} from "@steeze-ui/heroicons";
    export let Hst: _Hst;
    let i = 0;
</script>

<Hst.Story title="Abstract/Toast">
    <Hst.Variant title="Default">
        <ToastContainer />

        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                })}
        >
            Add Toast
        </button>
        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    status: ToastStatus.Danger,
                })}
        >
            Add Danger Toast
        </button>

        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    status: ToastStatus.Warning,
                })}
        >
            Add Warning Toast
        </button>
        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    status: ToastStatus.Success,
                })}
        >
            Add Success Toast
        </button>

        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magni animi perferendis at aperiam repudiandae obcaecati explicabo dolorum iste reiciendis voluptates ex, provident itaque! Aliquid maxime adipisci expedita deleniti. Eum, quas.`,
                })}
        >
            Add Toast with long text
        </button>
        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    ttl: 2000,
                })}
        >
            Add Toast with timeout
        </button>

        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    ttl: 2000,
                    dismissable: false,
                })}
        >
            Add Toast that isn't dismissable
        </button>
        <button
            on:click={() =>
                addToast({
                    content: `Test ${i++}.`,
                    icon: PaperAirplane,
                })}
        >
            Add Toast with a custom icon
        </button>
    </Hst.Variant>
</Hst.Story>

<style lang="postcss">
    button {
        @apply bg-gray-800 px-2 py-1 rounded-xl text-gray-50 block mb-2;
    }
</style>
