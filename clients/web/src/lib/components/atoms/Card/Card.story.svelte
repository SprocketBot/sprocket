<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Card from "./Card.svelte";

    export let Hst: _Hst;
    let header: string;
    let text: string;
    let buttonLink: string;
    let buttonText: string;
</script>

<Hst.Story title="Atoms/Card">
    <svelte:fragment slot="controls">
        <Hst.Text title="Card Header" bind:value={header} />
        <Hst.Text title="Card Text" bind:value={text} />
        <Hst.Text title="Button Link" bind:value={buttonLink} />
        <Hst.Text title="Button Text" bind:value={buttonText} />
    </svelte:fragment>
    <Hst.Variant title="Default Card">
        <Card {buttonLink} {buttonText}>
            <div slot="header">
                {header}
            </div>
            <div slot="text">
                {text}
            </div>
        </Card>
    </Hst.Variant>
    <Hst.Variant title="With Nav Button">
        <Card buttonLink="https://google.com">
            <div slot="header">
                {header}
            </div>
            <div slot="text">
                {text}
            </div>
        </Card>
    </Hst.Variant>
</Hst.Story>
