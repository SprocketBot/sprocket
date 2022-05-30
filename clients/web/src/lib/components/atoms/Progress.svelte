<script lang="ts">
    export let value: number;
    export let max: number;
</script>

<div class="flex gap-4 w-full items-center">
    <p>{value}</p>
    <progress class="progress progress-primary h-8"
              {value}
              {max}></progress>
    <p>{max}</p>
</div>
