<script lang="ts">
    import { fly } from "svelte/transition";
    import { cubicInOut } from 'svelte/easing'
    import { DatePicker } from 'date-picker-svelte'

    import type { FormControlState, FormControlSize } from '../form.types';
    import { Input } from "../Input";
    import { clickOutside } from "../../../../actions/clickOutside.action";
  
    export let size: FormControlSize = "md";
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;
    export let value: Date | undefined = undefined;

    const showDatepicker = () => datepickerVisible = true
    const hideDatepicker = () => datepickerVisible = false

    let datepickerVisible = false;
    let strValue: string | undefined;
    $: strValue = value?.toLocaleDateString();
</script>


<div class="datepicker size-{size} state-{state}">
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
        <div transition:fly={{ duration: 80, easing: cubicInOut, y: -5 }} use:clickOutside={{ callback: hideDatepicker }}>
            <!-- TODO accessibility isn't great with this Datepicker -->
            <DatePicker bind:value on:focusout={hideDatepicker} on:select={hideDatepicker} />
        </div>
    {/if}
</div>


<style lang="postcss">
    /* Themeing datepicker via CSS vars */
    :root {
        --date-picker-foreground: white; /* white */
        --date-picker-background: #2C2C2B; /* gray-700 */
        --date-picker-highlight-border: #FEBF2B; /* primary-500 */
        --date-picker-highlight-shadow: #3B3B3A; /* gray-600 */
        --date-picker-selected-color: white; /* white */
        --date-picker-selected-background: #FEBF2B; /* primary-500 */
    }

    .datepicker :global(input) {
        @apply cursor-pointer;
    }
</style>
