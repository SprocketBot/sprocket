<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Alert, { type AlertVariant } from "./Alert.svelte";

    export let Hst: _Hst;

    const variants: AlertVariant[] = ["info", "success", "warning", "error"]
</script>


<Hst.Story title="Atoms/Alert">
    <Hst.Variant title="Basic Alert">
        {#each variants as v}
            <Alert variant={v}>
                <span>This alerts the user of something important!</span>
            </Alert>
        {/each}
    </Hst.Variant>

    <Hst.Variant title="Without icon">
        {#each variants as v}
            <Alert variant={v} withIcon={false}>
                <span>This alerts the user of something important!</span>
            </Alert>
        {/each}
    </Hst.Variant>

    <Hst.Variant title="Not dissmissable">
        {#each variants as v}
            <Alert variant={v} dismissable={false}>
                <span>This alerts the user of something important!</span>
            </Alert>
        {/each}
    </Hst.Variant>

    <Hst.Variant title="With long content">
        {#each variants as v}
            <Alert variant={v}>
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
        {/each}
    </Hst.Variant>

    <Hst.Variant title="With details">
        {#each variants as v}
            <Alert variant={v}>
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
        {/each}
    </Hst.Variant>
</Hst.Story>
