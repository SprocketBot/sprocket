<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {Props} from "../../../histoire";
    import Accordion from "./Accordion.svelte";

    export let Hst: _Hst;

    let flush = false;
</script>

<Hst.Story title="Atoms/Accordion" layout={{type: "grid", width: 800}}>
    <svelte:fragment slot="controls">
        <Hst.Checkbox title="Flush" bind:value={flush} />

        <Props props={{flush}} />
    </svelte:fragment>

    <Hst.Variant title="Default" {flush}>
        <Accordion {flush}>
            <span slot="title">Accordion 1</span>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus aperiam,
                distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error veritatis. Iusto, dolorum
                quaerat?
            </p>
        </Accordion>
    </Hst.Variant>

    <Hst.Variant title="Several accordions" {flush}>
        <Accordion {flush}>
            <span slot="title">Accordion 1</span>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus aperiam,
                distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error veritatis. Iusto, dolorum
                quaerat?
            </p>
        </Accordion>
        <Accordion {flush}>
            <span slot="title">Accordion 1</span>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus aperiam,
                distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error veritatis. Iusto, dolorum
                quaerat?
            </p>
        </Accordion>
        <Accordion {flush}>
            <span slot="title">Accordion 1</span>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus aperiam,
                distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error veritatis. Iusto, dolorum
                quaerat?
            </p>
        </Accordion>
        <Accordion {flush}>
            <span slot="title">Accordion 1</span>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus aperiam,
                distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error veritatis. Iusto, dolorum
                quaerat?
            </p>
        </Accordion>
    </Hst.Variant>
</Hst.Story>
