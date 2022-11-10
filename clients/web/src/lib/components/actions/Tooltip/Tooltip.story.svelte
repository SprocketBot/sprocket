<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import { tooltip } from "./useTooltip.action";
    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/Tooltip">
    <Hst.Variant title="Default">
        <button use:tooltip={{content: "Test", position: "top"}}>Hello!</button>
    </Hst.Variant>
</Hst.Story>
