<script lang="ts">
    import {Stat} from "$lib/components";

    export let num: number = 0;
    export let label: string = "";
    export let description: string | undefined;
</script>


<Stat>
    <span slot="title">{label}</span>
    <span class="text-7xl text-sprocket" slot="value">{num}</span>
    <span slot="description">{description ?? ""}</span>
    <slot name="figure" slot="figure"/>
</Stat>

<style lang="postcss">
    div {
        @apply w-full h-full flex justify-center items-center flex-col;
    }
    .number-value {
        @apply text-7xl text-sprocket;
    }
</style>