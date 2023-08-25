<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Button from "./Button.svelte";

    export let Hst: _Hst;
    let label = "HAI";
    const onClick = () => {
        alert("You clicked the button. Congrats!");
    };
</script>

<Hst.Story title="Atoms/Button">
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
    </svelte:fragment>
    <Hst.Variant title="Default">
        <div class="grid grid-cols-3 text-2xl text-gray-50 gap-4">
            <div>Variant</div>
            <div>Default</div>
            <div>Outlined</div>

            <div>Default / Primary</div>
            <div><Button variant="default" on:click={onClick}>{label}</Button></div>
            <div><Button variant="default" on:click={onClick} outline>{label}</Button></div>

            <div>Alt</div>
            <div><Button variant="alt" on:click={onClick}>{label}</Button></div>
            <div><Button variant="alt" on:click={onClick} outline>{label}</Button></div>

            <div>Success</div>
            <div><Button variant="success" on:click={onClick}>{label}</Button></div>
            <div><Button variant="success" on:click={onClick} outline>{label}</Button></div>

            <div>Warning</div>
            <div><Button variant="warning" on:click={onClick}>{label}</Button></div>
            <div><Button variant="warning" on:click={onClick} outline>{label}</Button></div>

            <div>Danger</div>
            <div><Button variant="danger" on:click={onClick}>{label}</Button></div>
            <div><Button variant="danger" on:click={onClick} outline>{label}</Button></div>
        </div>
    </Hst.Variant>
    <Hst.Variant title="Alternate">
        <Button type="secondary" on:click={onClick}>{label}</Button>
    </Hst.Variant>
</Hst.Story>
