<script lang="ts">
	import { Toolbox as ToolboxIcon } from '@steeze-ui/phosphor-icons';
	import DashboardSection from '$lib/components/DashboardSection.svelte';
	import Toolbox from './Toolbox.svelte';
</script>

<DashboardSection size="fill" transparent>
	<h1 class="text-3xl text-primary-500 font-bold">Organization Manager</h1>
</DashboardSection>
<div class="col-start-3">
	
	<DashboardSection title="Toolbox" icon={ToolboxIcon}>
		<Toolbox />
	</DashboardSection>
</div>
<slot />

