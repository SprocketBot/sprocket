<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import ProgressBar from "./ProgressBar.svelte";
    import type {ProgressBarSize, ProgressBarVariant, ProgressLocation} from "./types";

    const sizeOptions = ["small", "default", "large", "extraLarge"];
    const variantOptions = ["info", "primary"];
    const locationOptions = ["hidden", "inside", "outside"];

    export let Hst: _Hst;
    let label: string;
    let size: ProgressBarSize;
    let progress = 50;
    let progressLocation: ProgressLocation;
    let variant: ProgressBarVariant;
</script>

<Hst.Story title="Atoms/ProgressBar">
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizeOptions} />
        <Hst.Select title="Variant" bind:value={variant} options={variantOptions} />
        <Hst.Select title="Progress Location" bind:value={progressLocation} options={locationOptions} />
        <Hst.Slider title="Progress" bind:value={progress} min={0} max={100} />
    </svelte:fragment>
    <Hst.Variant title="Default">
        <ProgressBar {progress} {label} {size} {variant} {progressLocation} />
    </Hst.Variant>
    <Hst.Variant title="With Label">
        <ProgressBar label="This label is outside the bar" {variant} size="large" {progress} />
    </Hst.Variant>
    <Hst.Variant title="With Label Inside">
        <ProgressBar label="Just another label" {variant} {progress} progressLocation="hidden" />
    </Hst.Variant>
    <Hst.Variant title="Show All Sizes">
        <ProgressBar {progress} {label} {progressLocation} size="small" />
        &nbsp;
        <ProgressBar {progress} {label} {progressLocation} />
        &nbsp;
        <ProgressBar {progress} {label} {progressLocation} size="large" />
        &nbsp;
        <ProgressBar {progress} {label} {progressLocation} size="extraLarge" />
    </Hst.Variant>
</Hst.Story>
