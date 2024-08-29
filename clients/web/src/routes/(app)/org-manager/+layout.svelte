<script lang="ts">
	import { Toolbox as ToolboxIcon } from '@steeze-ui/phosphor-icons';
	import DashboardSection from '$lib/components/DashboardSection.svelte';
	import Toolbox from './Toolbox.svelte';
</script>

<div class="col-start-3">
	<DashboardSection title="Toolbox" icon={ToolboxIcon}>
		<Toolbox />
	</DashboardSection>
</div>
<slot />

