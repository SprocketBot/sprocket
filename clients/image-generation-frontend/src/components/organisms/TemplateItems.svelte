<script lang="ts">
    import { onMount } from "svelte";

    import { getTemplate } from "../../api";
    import TemplateItem from "../molecules/TemplateItem.svelte";

    export let templateName: string;
    let template: any = {};
    onMount(() => getTemplate(templateName).then((r) => (template = r)));
    $: if (templateName) getTemplate(templateName).then((r) => (template = r));
</script>

<TemplateItem item={template} />
