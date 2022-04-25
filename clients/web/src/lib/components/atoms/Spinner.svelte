<script lang="ts">
    type T = $$Generic;
    interface $$Slots {
        default: {
            data: T;
        };
        error: {
            error: Error;
        };
    }

    export let promise: Promise<T>;
</script>

{#await promise}
<span>Loading...</span>
{:then data}
    <slot {data}/>
{:catch error}
    <slot name="error" {error}/>
{/await}