<script lang="ts">
  export let projectName;
  export let filterValues;

  const filters = [];
  for (const key in filterValues) {
      filters.push({filter: key, value: filterValues[key]});
  }
</script>

<div>
  <p>{projectName}</p>
</div>

<div>
 {#each filters as filter}
    <p>{filter.filter} : {filter.value}</p>
  {/each}
</div>