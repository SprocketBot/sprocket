<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import CenterCard from "./CenterCard.svelte";
    export let Hst: _Hst;
</script>

<Hst.Story title="Layouts/CenterCard" layout={{type: "single"}}>
    <Hst.Variant title="Default">
        <CenterCard>Page Content</CenterCard>
    </Hst.Variant>
</Hst.Story>
