<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Button from "./Button.svelte";
    import AltButton from "./AltButton.svelte";

    export let Hst: _Hst;
    let label:string = "HAI";
</script>

<Hst.Story title="Atoms/Button">
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
    </svelte:fragment>
    <Hst.Variant title="Default">
        <Button {label} />
    </Hst.Variant>
    <Hst.Variant title="Alternate">
        <AltButton {label} />
    </Hst.Variant>
</Hst.Story>
