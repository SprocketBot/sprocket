<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import { stringify } from "postcss";
    import Alert, { type AlertVariant } from "./Alert.svelte";

    export let Hst: _Hst;

    const variants: AlertVariant[] = ["info", "success", "warning", "error"]

    let variant: AlertVariant = "info"
    let dismissible = true
    let withIcon = true
</script>


<Hst.Story title="Atoms/Alert" layout={{ type: 'grid', width: 800 }}>
    <svelte:fragment slot="controls">
        <Hst.Select title="Variant" bind:value={variant} options={variants} />
        <Hst.Checkbox title="Dismissible" bind:value={dismissible} />
        <Hst.Checkbox title="With Icon" bind:value={withIcon} />
        <pre class="m-2 p-2 bg-black/20 ">{JSON.stringify({variant, dismissible, withIcon}, null, 2)}</pre>
    </svelte:fragment>

    <Hst.Variant title="Default" {variant} {dismissible} {withIcon}>
        <Alert variant={variant} dismissible={dismissible} withIcon={withIcon}>
            <span>This alerts the user of something important!</span>
        </Alert>
    </Hst.Variant>

    <Hst.Variant title="With long content" {variant} {dismissible} {withIcon}>
        <Alert variant={variant} dismissible={dismissible} withIcon={withIcon}>
            <span>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed scelerisque enim. Donec congue,
                    dolor quis auctor tincidunt, risus sem egestas ipsum, vitae vehicula nunc ante eget velit. Aenean
                    tincidunt non eros sit amet pellentesque. Vivamus vehicula facilisis risus ut tempor. Vestibulum
                    ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec in congue massa,
                    non pretium nisl. Cras vestibulum massa id orci placerat sollicitudin. Quisque pharetra augue nec
                    sem ultrices finibus.
                </p>
            </span>
        </Alert>
    </Hst.Variant>

    <Hst.Variant title="With details" {variant} {dismissible} {withIcon}>
        <Alert variant={variant} dismissible={dismissible} withIcon={withIcon}>
            <span>Look at this</span>
            <span slot="details">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed scelerisque enim. Donec congue,
                    dolor quis auctor tincidunt, risus sem egestas ipsum, vitae vehicula nunc ante eget velit. Aenean
                    tincidunt non eros sit amet pellentesque. Vivamus vehicula facilisis risus ut tempor.
                </p>
                <ul class="ml-4 list-inside list-disc">
                    <li>Something 1</li>
                    <li>Something 2</li>
                    <li>Something 3</li>
                </ul>
            </span>
        </Alert>
    </Hst.Variant>
</Hst.Story>
