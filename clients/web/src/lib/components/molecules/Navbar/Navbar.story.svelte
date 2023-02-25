<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Navbar from "./Navbar.svelte";
    export let Hst: _Hst;
</script>

<Hst.Story title="Molecules/Navbar">
    <Hst.Variant title="Default">
        <Navbar />
    </Hst.Variant>
</Hst.Story>
