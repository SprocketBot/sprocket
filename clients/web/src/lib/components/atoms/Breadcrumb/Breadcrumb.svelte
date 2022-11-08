<script lang="ts">
    import Crumb from "./Crumb.svelte";
    import {getContext, hasContext} from "svelte";
    import {type BreadcrumbContext, BREADCRUMB_CONTEXT_KEY} from "./types";

    const crumbs = hasContext(BREADCRUMB_CONTEXT_KEY) ? getContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY) : [];
</script>

<nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1">
        {#each crumbs as crumb, i}
            <Crumb {crumb} active={i === crumbs.length - 1} />
        {/each}
    </ol>
</nav>
