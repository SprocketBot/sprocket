<script lang="ts">
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Alert from './Alert.svelte';

  const argTypes = {
    variant: { control: 'select', options: ['info', 'success', 'error', 'warning'] },
    content: { control: 'text' },
    dismissable: {control: 'boolean'}
  };
</script>

<Meta title="atoms/Alert" component={Alert} {argTypes} />

<Template let:args>
	<Alert {...args}>
		<span class="flex-grow">{args.content}</span>
	</Alert>
</Template>

<Story name="Info" args={{ content: 'Here is some important information!', dismissable: false, icon: "info" }} />
<Story name="Warning" args={{ content: 'Here is some important information!', dismissable: false, variant: "warning" }} />
<Story name="Error" args={{ content: 'Here is some important information!', dismissable: false, variant: "error" }} />
<Story name="Success" args={{ content: 'Here is some important information!', dismissable: false, variant: "success" }} />
