<script lang="ts">
  import Alert from './Alert.svelte';

  export let Hst: any;

  let content = 'lorem...';
</script>

<Hst.Story title="Atoms/Alert" layout={{type: "grid", width: "50%"}}>
	<Hst.Variant title="Info">
		<Alert variant="info">{content}</Alert>
	</Hst.Variant>
	<Hst.Variant title="Info/Dismissable">
		<Alert dismissable variant="info">{content}</Alert>
	</Hst.Variant>
	<Hst.Variant title="Warning">
		<Alert variant="warning">{content}</Alert>
	</Hst.Variant>
	<Hst.Variant title="Warning/Dismissable">
		<Alert dismissable variant="warning">{content}</Alert>
	</Hst.Variant>
	<Hst.Variant title="Error">
		<Alert variant="error">{content}</Alert>
	</Hst.Variant>

	<Hst.Variant title="Error/Dismissable">
		<Alert dismissable variant="error">{content}</Alert>
	</Hst.Variant>


	<Hst.Variant title="Success">
		<Alert variant="success">{content}</Alert>
	</Hst.Variant>
	<Hst.Variant title="Success/Dismissable">
		<Alert dismissable variant="success">{content}</Alert>
	</Hst.Variant>


	<svelte:fragment slot="controls">
		<dl class="pl-4 pt-2 flex flex-col gap-2">
			<dt>Content:</dt>
			<dd><textarea class="bg-gray-800 px-2 py-1" bind:value={content}></textarea></dd>
		</dl>

	</svelte:fragment>

</Hst.Story>
