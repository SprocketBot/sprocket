<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Avatar from "./Avatar.svelte";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/Avatar">
    <Hst.Variant title="Default">
        <Avatar/>
    </Hst.Variant>
    <Hst.Variant title="Custom">
        <Avatar url="https://picsum.photos/200/300"/>
    </Hst.Variant>
</Hst.Story>
