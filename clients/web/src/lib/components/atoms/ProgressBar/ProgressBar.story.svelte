<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import ProgressBar from "./ProgressBar.svelte";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/ProgressBar">
    <Hst.Variant title="Default">
        <ProgressBar progress={75.6767676} />
    </Hst.Variant>
    <Hst.Variant title="With Label">
        <ProgressBar label={true} size="large" />
    </Hst.Variant>
    <Hst.Variant title="With Label Inside">
        <ProgressBar label={true} labelOutside={false} />
    </Hst.Variant>
    <Hst.Variant title="Show All Sizes">
        <ProgressBar size="small" />
        &nbsp;
        <ProgressBar />
        &nbsp;
        <ProgressBar size="large" />
        &nbsp;
        <ProgressBar size="extraLarge" />
    </Hst.Variant>
</Hst.Story>
