<script lang="ts">
    import {user} from "$lib/stores/user";
</script>

<section>
    <label>
        Player Id
        <input type="number" bind:value={$user.userId} readonly min="0" />
    </label>
    <label>
        Player Name
        <input type="text" bind:value={$user.username} readonly />
    </label>
</section>

<style lang="postcss">
    section {
        @apply grid grid-cols-2;
        label {
            @apply contents;
        }
        input {
            @apply bg-gray-700 outline-none;
        }
    }
</style>
