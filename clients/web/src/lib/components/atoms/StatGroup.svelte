<script lang="ts">
    export let responsive: boolean = false;
</script>

<div class="shadow stats {responsive ? "stats-vertical lg:stats-horizontal" : "" }">
    <slot/>
</div>