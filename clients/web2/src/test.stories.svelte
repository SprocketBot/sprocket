<script lang="ts">
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
    import Hi from "./test.svelte"
</script>

<Meta title="Hi" component={Hi} />

<Template let:args>
    <Hi/>
</Template>

<Story name="Default" args={{}} />