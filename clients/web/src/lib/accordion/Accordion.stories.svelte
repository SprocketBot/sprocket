<script lang="ts">
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Accordion from './Accordion.svelte';
  const argTypes = {};
</script>

<Meta title="atoms/Accordion" component={Accordion} {argTypes} />

<Template let:args>
	<div>
		<Accordion {...args}>
			<span slot="title">Accordion 1</span>
			<p>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus
				aperiam, distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error
				veritatis. Iusto, dolorum quaerat?
			</p>
		</Accordion>
		<Accordion {...args}>
			<span slot="title">Accordion 2</span>
			<p>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt quam esse, quis corrupti
				repudiandae omnis incidunt neque? Quasi, corrupti maiores dolore laborum, quaerat, nobis
				amet mollitia tempora tempore debitis deleniti.
			</p>
		</Accordion>
	</div>
</Template>

<Story name="Default" args={{ open: false, flush: false }} />
<Story name="Flush" args={{ open: false, flush: true }} />

<style lang="postcss">
    div {
        @apply bg-gray-900 p-12;
    }
</style>
