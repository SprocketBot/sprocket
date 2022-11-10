<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    export let Hst: _Hst;

    import Tooltip from "./Tooltip.svelte";
</script>

<Hst.Story title="Atoms/Tooltip">
    <Hst.Variant title="Default">
        <Tooltip>
            <button>Hello!</button>
        </Tooltip>
    </Hst.Variant>
</Hst.Story>
