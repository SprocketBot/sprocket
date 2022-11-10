<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import ProgressBar from "./ProgressBar.svelte";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/ProgressBar">
    <Hst.Variant title="Default">
        <ProgressBar />
    </Hst.Variant>
    <Hst.Variant title="Show All Sizes">
        <ProgressBar />
        &nbsp;
        <ProgressBar size={2} />
        &nbsp;
        <ProgressBar size={3} />
    </Hst.Variant>
</Hst.Story>
