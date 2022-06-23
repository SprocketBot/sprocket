<script lang="ts">

</script>

<section>
    <div></div>
    <div></div>
</section>

<style lang="postcss">
    section {
        height:100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }
    section div:first-child {
        @apply border-b-2 border-gray-600;
    }
</style>