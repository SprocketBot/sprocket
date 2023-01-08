<script lang="ts">
    import type { IconSource } from "@steeze-ui/svelte-icon/types";

    import TimelineItemInner from "./TimelineItemInner.svelte";

    export let title: string;
    export let date: Date | undefined = undefined;
    export let icon: IconSource | undefined = undefined;
    export let href: string | undefined = undefined;
</script>


{#if href}
    <a class="cursor-pointer" href={href}>
        <TimelineItemInner {title} {date} {icon}>
            <slot />
        </TimelineItemInner>
    </a>
{:else}
    <TimelineItemInner {title} {date} {icon}>
        <slot />
    </TimelineItemInner>
{/if}
