<script lang="ts">
    export let props: Record<string, unknown>;
</script>

<div class="flex flex-col items-center">
    <pre class="w-11/12 m-2 p-2 rounded-md bg-gray-800">{JSON.stringify(props, null, 2)}</pre>
</div>
