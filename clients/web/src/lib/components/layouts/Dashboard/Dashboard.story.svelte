<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Dashboard from "./Dashboard.svelte";
    export let Hst: _Hst;
</script>

<Hst.Story title="Layouts/Dashboard" layout={{type: "single"}}>
    <Hst.Variant title="Default">
        <Dashboard>Page Content</Dashboard>
    </Hst.Variant>
</Hst.Story>
