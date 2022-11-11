<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import ProgressBar from "./ProgressBar.svelte";

    type sizes = "small" | "default" | "large" | "extraLarge";
    const sizeOptions = ["small", "default", "large", "extraLarge"];

    export let Hst: _Hst;
    let label: string;
    let size: sizes;
    let progress: number = 50;
    let labelOutside: boolean = true;
</script>

<Hst.Story title="Atoms/ProgressBar">
    <svelte:fragment slot="controls">
        <Hst.Text title="Label" bind:value={label} />
        <Hst.Select title="Size" bind:value={size} options={sizeOptions} />
        <Hst.Slider title="Progress" bind:value={progress} min={0} max={100} />
        <Hst.Checkbox title="Label outside bar" bind:value={labelOutside} />
    </svelte:fragment>
    <Hst.Variant title="Default">
        <ProgressBar {progress} {label} {size} {labelOutside} />
    </Hst.Variant>
    <Hst.Variant title="With Label">
        <ProgressBar label="This label is outside the bar" size="large" {progress} />
    </Hst.Variant>
    <Hst.Variant title="With Label Inside">
        <ProgressBar label="Just another label" {progress} labelOutside={false} />
    </Hst.Variant>
    <Hst.Variant title="Show All Sizes">
        <ProgressBar {progress} {label} {labelOutside} size="small" />
        &nbsp;
        <ProgressBar {progress} {label} {labelOutside} />
        &nbsp;
        <ProgressBar {progress} {label} {labelOutside} size="large" />
        &nbsp;
        <ProgressBar {progress} {label} {labelOutside} size="extraLarge" />
    </Hst.Variant>
</Hst.Story>
