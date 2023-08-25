<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import type {FormControlState, FormControlSize} from "../form.types";
    import Select from "./Select.svelte";
    import type {SelectOptions} from "./types";

    export let Hst: _Hst;

    const sizes: FormControlSize[] = ["sm", "md", "lg"];
    const states: FormControlState[] = ["none", "valid", "invalid"];
    const options: SelectOptions<number> = [
        {label: "Option 1", value: 1},
        {label: "Option 2", value: 2},
        {label: "Option 3", value: 3},
        {label: "Option 4", value: 4},
    ];

    let label = "Username";
    let size: FormControlSize = "md";
    let placeholder = "Select an option...";
    let disabled = false;
    let state: FormControlState = "none";
    let error = "";

    let value: number | undefined = undefined;
</script>

<Hst.Story title="Atoms/Form/Select" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />
        <Hst.Number title="Value" bind:value />
    </svelte:fragment>

    <Hst.Variant title="Default" {size} {label} {placeholder} {disabled} {state} {error} bind:value>
        <Select {options} {size} {label} {placeholder} {disabled} {state} {error} bind:value />
    </Hst.Variant>
</Hst.Story>
