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

    <Hst.Variant title="With actions" {variant} {dismissible} {withIcon}>
        <Alert variant={variant} dismissible={dismissible} withIcon={withIcon}>
            <span>This alerts the user of something important!</span>

            <span slot="actions">
                <div class="flex">
                    <button type="button" class="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-gray-800 dark:hover:bg-gray-900">
                      <svg aria-hidden="true" class="-ml-0.5 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>
                      View more
                    </button>
                    <button type="button" class="text-gray-900 bg-transparent border border-gray-900 hover:bg-gray-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:border-gray-800 dark:text-gray-800 dark:hover:text-white" data-dismiss-target="#alert-additional-content-1" aria-label="Close">
                      Dismiss
                    </button>
                  </div>
            </span>
        </Alert>
    </Hst.Variant>
</Hst.Story>
