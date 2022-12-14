<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Datepicker from "./Datepicker.svelte";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/Form/Datepicker">
    <Hst.Variant title="Default" >
        <Datepicker />
    </Hst.Variant>
</Hst.Story>
