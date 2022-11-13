<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Card from "./Card.svelte";

    type sizes = "small" | "default" | "large" | "extraLarge";

    const sizeOptions = ["small", "default", "large", "extraLarge"];

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
        <Card {header} {text} {buttonLink} {buttonText} />
    </Hst.Variant>
    <Hst.Variant title="With Nav Button">
        <Card {header} {text} buttonLink="https://google.com" />
    </Hst.Variant>
</Hst.Story>
