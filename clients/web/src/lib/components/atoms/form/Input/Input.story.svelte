<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {Pencil} from "@steeze-ui/heroicons";
    import {Props} from "$lib/histoire";
    import type {FormControlState, FormControlSize} from "../form.types";
    import Input from "./Input.svelte";

    export let Hst: _Hst;

    const sizes: FormControlSize[] = ["sm", "md", "lg"];
    const states: FormControlState[] = ["none", "valid", "invalid"];

    let label = "Username";
    let size: FormControlSize = "md";
    let placeholder = "";
    let disabled = false;
    let state: FormControlState = "none";
    let error = "";
    let value = "";
</script>

<Hst.Story title="Atoms/Form/Input" layout={{type: "grid", width: 500}}>
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizes} />
        <Hst.Text title="Placeholder" bind:value={placeholder} />
        <Hst.Checkbox title="Disabled" bind:value={disabled} />
        <Hst.Select title="State" bind:value={state} options={states} />
        <Hst.Text title="Error" bind:value={error} />
        <Hst.Text title="Value" bind:value />

        <Props props={{label, size, placeholder, disabled, state, error, value}} />
    </svelte:fragment>

    <Hst.Variant title="Default">
        <Input {label} {size} {placeholder} {disabled} {state} {error} bind:value />
    </Hst.Variant>

    <Hst.Variant title="With addonLeft">
        <Input {label} {size} {placeholder} {disabled} {state} {error} bind:value>
            <!-- Addons can be anything, including icons! -->
            <Icon slot="addonLeft" class="h-3/6" src={Pencil} />
        </Input>
    </Hst.Variant>

    <Hst.Variant title="With addonRight">
        <Input {label} {size} {placeholder} {disabled} {state} {error} bind:value>
            <!-- Addons can be anything, including text with additional styling! -->
            <span slot="addonRight" class="h-full text-xl font-bold bg-gray-600">%</span>
        </Input>
    </Hst.Variant>
</Hst.Story>
