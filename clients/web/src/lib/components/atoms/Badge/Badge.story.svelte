<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import Badge from "./Badge.svelte";
    import {FingerPrint, Sparkles, PaperClip, Hashtag, XMark} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import type {BadgeSizeVariant, BadgeColorVariant} from "./types";
    export let Hst: _Hst;

    const SizeOptions: BadgeSizeVariant[] = ["sm", "md"];
    const ColorOptions: BadgeColorVariant[] = ["info", "gray", "danger", "success", "warning", "primary", "secondary"];
    const IconOptions = [
        {label: "XMark", value: XMark},
        {label: "Hashtag", value: Hashtag},
        {label: "FingerPrint", value: FingerPrint},
        {label: "PaperClip", value: PaperClip},
        {label: "Sparkles", value: Sparkles},
    ];

    let size: BadgeSizeVariant = "sm";
    let color: BadgeColorVariant = "info";
    let icon: IconSource = undefined;
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
            <span>This is a badge</span>
        </Badge>
    </Hst.Variant>
</Hst.Story>
