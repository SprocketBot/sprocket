<script lang="ts">
    import {addCrumb} from "./addCrumb";
    import type {ICrumb} from "./types";

    export let crumb: ICrumb;
    addCrumb(crumb);
</script>

<slot />
