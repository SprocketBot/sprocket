<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Badge, {type ColorVariant, type SizeVariant} from "./Badge.svelte";
    import {FingerPrint, Sparkles, PaperClip, Hashtag, XMark} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    export let Hst: _Hst;

    const SizeOptions: SizeVariant[] = ["sm", "md"];
    const ColorOptions: ColorVariant[] = ["info", "gray", "danger", "success", "warning", "primary", "secondary"];
    const IconOptions = [
        {label: "XMark", value: XMark},
        {label: "Hashtag", value: Hashtag},
        {label: "FingyPrint", value: FingerPrint},
        {label: "PaperClip", value: PaperClip},
        {label: "Sparkles", value: Sparkles},
    ];

    let size: SizeVariant = "sm";
    let color: ColorVariant = "info";
    let icon: IconSource = XMark;
    let dismissible = true;
</script>

<Hst.Story title="Atoms/Badge">
    <svelte:fragment slot="controls">
        <Hst.Select title="Size" bind:value={size} options={SizeOptions} />
        <Hst.Select title="Color" bind:value={color} options={ColorOptions} />
        <Hst.Checkbox title="Dismissible" bind:value={dismissible} />
        <Hst.Select title="icon" bind:value={icon} options={IconOptions} />
        <pre class="m-2 p-2 bg-black/20 ">{JSON.stringify({size, color}, null, 2)}</pre>
    </svelte:fragment>

    <Hst.Variant title="Default">
        <Badge {size} {icon} {color} {dismissible}>
            <div>test</div>
        </Badge>
    </Hst.Variant>
</Hst.Story>
