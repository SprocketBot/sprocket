<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Card from "./Card.svelte";

    export let Hst: _Hst;
    let text =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi justo ante, luctus eget scelerisque ac, pulvinar at leo. Phasellus eu odio nec sem aliquam vestibulum. Donec ultrices dapibus velit, in lobortis urna molestie eget.";
</script>

<Hst.Story title="Atoms/Card">
    <svelte:fragment slot="controls">
        <Hst.Text title="Card Text" bind:value={text} />
    </svelte:fragment>
    <Hst.Variant title="Default Card">
        <Card>
            <div>
                {text}
            </div>
        </Card>
    </Hst.Variant>
    <Hst.Variant title="With Nav Button">
        <Card buttonLink="https://google.com">
            <div>
                {text}
            </div>
        </Card>
    </Hst.Variant>
</Hst.Story>
