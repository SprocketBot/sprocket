<script lang="ts">
    export let responsive: boolean = false;
</script>

<div class="shadow
            stats
            {responsive ? "stats-vertical lg:stats-horizontal" : "" }
            bg-base-100/20
            border-primary/20
            border-2">
    <slot/>
</div>
