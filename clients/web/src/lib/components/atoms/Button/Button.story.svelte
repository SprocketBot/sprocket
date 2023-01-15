<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Button from "./Button.svelte";

    export let Hst: _Hst;
    let label = "HAI";
    const onClick = () => {
        alert("You clicked the button. Congrats!");
    };
</script>

<Hst.Story title="Atoms/Button">
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
    </svelte:fragment>
    <Hst.Variant title="Default">
        <Button type="primary" on:click={onClick}>{label}</Button>
    </Hst.Variant>
    <Hst.Variant title="Alternate">
        <Button type="secondary" on:click={onClick}>{label}</Button>
    </Hst.Variant>
</Hst.Story>
