<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import ListGroup from "./ListGroup.svelte";
    import ListGroupItem from "./ListGroupItem.svelte";

    import {Cake} from "@steeze-ui/heroicons";

    export let Hst: _Hst;
</script>

<Hst.Story title="Atoms/ListGroup" layout={{type: "single"}}>
    <svelte:fragment slot="controls" />

    <Hst.Variant title="Default">
        <ListGroup>
            <ListGroupItem icon={Cake}>hello</ListGroupItem>
            <ListGroupItem icon={Cake}>hello</ListGroupItem>
            <ListGroupItem><span class="text-danger">hello</span></ListGroupItem>
            <ListGroupItem>hello</ListGroupItem>
        </ListGroup>
    </Hst.Variant>
</Hst.Story>
