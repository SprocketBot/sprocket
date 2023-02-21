<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";

    import {Props} from "$lib/histoire";

    import type {FormControlSize, FormControlState} from "../form.types";
    import Datepicker from "./Datepicker.svelte";

    export let Hst: _Hst;

    const sizes: FormControlSize[] = ["sm", "md", "lg"];
    const states: FormControlState[] = ["none", "valid", "invalid"];

    let label = "Match Date";
    let size: FormControlSize = "md";
    let placeholder = "MM/DD/YYYY";
    let disabled = false;
    let state: FormControlState = "none";
    let error = "";
    let value: Date | undefined = undefined;
</script>

<Hst.Story title="Atoms/Form/Datepicker" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />

        <Props props={{label, size, placeholder, disabled, state, error, value}} />
    </svelte:fragment>

    <Hst.Variant title="Default">
        <div class="h-96">
            <Datepicker {label} {size} {placeholder} {disabled} {state} {error} bind:value />
        </div>
        clear
    </Hst.Variant>

    <Hst.Variant title="Note">
        <div class="bg-gray-600 text-gray-300 text-xs italic p-2 rounded-md">
            Note: Histoire is a little funky when changing props while the Datepicker has a value (it will not update
            and there will be errors in the console about a Proxy object). This problem does not exist in real use.
        </div>
    </Hst.Variant>
</Hst.Story>
