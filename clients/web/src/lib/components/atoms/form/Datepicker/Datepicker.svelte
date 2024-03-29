<script lang="ts">
    import {fly} from "svelte/transition";
    import {cubicInOut} from "svelte/easing";
    import {DatePicker} from "date-picker-svelte";

    import type {FormControlState, FormControlSize} from "../form.types";
    import {Input} from "../Input";
    import {clickOutside} from "../../../../actions/clickOutside.action";
    import {Portal} from "../../../abstract";

    export let size: FormControlSize = "md";
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;
    export let value: Date | undefined = undefined;

    const showDatepicker = () => (datepickerVisible = true);
    const hideDatepicker = () => (datepickerVisible = false);

    let datepickerVisible = false;
    let strValue: string | undefined;
    $: strValue = value?.toLocaleDateString();
</script>

<div class="__sprocket_datepicker relative size-{size} state-{state}">
    <Input
        readonly={true}
        bind:size
        bind:label
        bind:placeholder
        bind:disabled
        bind:state
        bind:error
        bind:value={strValue}
        on:focusin={showDatepicker}
        on:click={showDatepicker}
    />

    {#if datepickerVisible}
        <div
            class="absolute left-0 top-full z-50 mt-2"
            transition:fly={{duration: 80, easing: cubicInOut, y: -5}}
            use:clickOutside={{callback: hideDatepicker}}
        >
            <!-- TODO accessibility isn't great with this Datepicker. Maybe we could use a native input type="date" for SR users? -->
            <DatePicker bind:value on:focusout={hideDatepicker} on:select={hideDatepicker} />
        </div>
    {/if}
</div>

<style lang="postcss">
    /* Themeing datepicker via CSS vars */
    :root {
        --date-picker-foreground: white; /* white */
        --date-picker-background: #2c2c2b; /* gray-700 */
        --date-picker-highlight-border: #febf2b; /* primary-500 */
        --date-picker-highlight-shadow: #3b3b3a; /* gray-600 */
        --date-picker-selected-color: white; /* white */
        --date-picker-selected-background: #febf2b; /* primary-500 */
    }

    .__sprocket_datepicker {
        :global(input) {
            @apply cursor-pointer;
        }

        :global(.cell) {
            @apply cursor-pointer;
        }

        :global(option) {
            @apply bg-gray-700 text-gray-50;
        }
    }
</style>
