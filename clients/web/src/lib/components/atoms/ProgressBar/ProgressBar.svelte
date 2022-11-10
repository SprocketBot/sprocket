<script lang="ts">
    export let size = 2;
</script>

<div class="w-full rounded-full dark:bg-gray-800">
    <div class="bg-info-600 rounded-full size-{size}" style="width: 45%" />
</div>

<style lang="postcss">
    .size-1 {
        @apply h-1.5;
    }

    .size-2 {
        @apply h-2.5;
    }

    .size-3 {
        @apply h-4;
    }

    .size-4 {
        @apply h-6;
    }
</style>
