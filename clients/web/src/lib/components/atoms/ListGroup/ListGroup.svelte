<script lang="ts">
    export let fullWidth = false;
</script>

<div class="border bg-gray-700 border-gray-600 text-white rounded-lg" class:w-full={fullWidth} class:w-48={!fullWidth}>
    <slot />
</div>
