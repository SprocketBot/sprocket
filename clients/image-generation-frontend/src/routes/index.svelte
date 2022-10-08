<style lang="postcss">
    section {
        @apply px-4 py-4 bg-sproc_light_gray-800 w-1/2
    h-3/4 flex flex-col justify-start;
    }
    /* h2 {
    @apply text-xl font-bold text-center text-primary-500;
} */
    h2 {
        @apply text-lg font-bold  border-b-primary-500 my-2;
    }
    form {
        @apply flex mb-3;
    }
    form > label {
        @apply flex-grow text-center cursor-pointer;
    }
    form > .selected {
        @apply bg-primary-500 text-sproc_light_gray-800;
    }
    input[type="radio"] {
        @apply hidden mb-3;
    }

    span {
        @apply px-4;
    }
    /* button {
        @apply justify-self-end px-2 py-1 bg-primary-500 hover:bg-primary-600 m-4 text-sproc_dark_gray-500 mb-2;
    } */
</style>

<script lang="ts" context="module">
    import type {Load} from "@sveltejs/kit";
    export const load: Load = async ({url}) => {
        let action = "create";
        if (url.searchParams.has("action")) {
            switch (url.searchParams.get("action")) {
                case "run":
                    action = "run";
                    break;
                case "edit":
                    action = "edit";
                    break;
                default:
                    break;
            }
        }
        return {
            props: {
                action,
            },
        };
    };
</script>

<script lang="ts">
    import {getImagesOfType, getImageTypes, getTemplate} from "$src/api";

    import ImageTypeSelector from "$src/components/molecules/ImageTypeSelector.svelte";
    import PageHeader from "$src/components/molecules/PageHeader.svelte";
    import CreateOptions from "$src/components/organisms/CreateOptions.svelte";
    import EditOptions from "$src/components/organisms/EditOptions.svelte";
    import RunOptions from "$src/components/organisms/RunOptions.svelte";

    import {slide} from "svelte/transition";
    import type {ImageTypeItem} from "$src/types";

    export let action;
    let imageTypeItem: ImageTypeItem;
</script>

<section>
    <PageHeader />

    <div class="image-type">
        <h2>As An <span> image-gen user</span></h2>
        <h2>I want to</h2>
        <form>
            <label class={action === "create" ? "selected" : ""}>
                <input type="radio" bind:group={action} value={"create"} />
                Create
            </label>
            <label class={action === "edit" ? "selected" : ""}>
                <input type="radio" bind:group={action} value={"edit"} />
                Edit
            </label>
            <label class={action === "run" ? "selected" : ""}>
                <input type="radio" bind:group={action} value={"run"} />
                Run
            </label>
        </form>

        <h2>A Template Using Data From</h2>
        {#await getImageTypes()}
            <h2>fetching image types</h2>
        {:then imageTypeItems}
            <ImageTypeSelector {imageTypeItems} bind:value={imageTypeItem} />

            {#if !imageTypeItem}
                <div class="unselected">
                    <h2>Select and Image Type</h2>
                </div>
            {:else}
                <div class="action-option">
                    {#if action === "create"}
                        <div in:slide|local>
                            <CreateOptions {imageTypeItem} />
                        </div>
                    {:else}
                        <div in:slide|local>
                            {#await getImagesOfType(imageTypeItem.reportCode)}
                                <h2>fetching saved templates</h2>
                            {:then savedImages}
                                {#if action === "edit"}
                                    <EditOptions
                                        {imageTypeItem}
                                        {savedImages}
                                    />
                                {:else}
                                    <div in:slide|local>
                                        <RunOptions
                                            {imageTypeItem}
                                            {savedImages}
                                        />
                                    </div>
                                {/if}
                            {:catch error}
                                <h1>Sorry!</h1>
                                <p>
                                    We have encountered an error fetching sved
                                    Images.
                                </p>
                                <pre>{error}</pre>
                            {/await}
                        </div>
                    {/if}
                </div>
            {/if}
        {:catch error}
            <h1>Sorry!</h1>
            <p>We have encountered an error fetching image types.</p>
            <pre>{error}</pre>
        {/await}
    </div>
</section>
