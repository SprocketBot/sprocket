<script lang="ts">
  import Accordion from './Accordion.svelte';

  export let Hst: any;
  console.log(Hst)
</script>

<Hst.Story title="Atoms/Accordion">
	<Hst.Variant title="Default">
		<Accordion>
			<span slot="title">Accordion 1</span>
			<p>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus
				aperiam, distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error
				veritatis. Iusto, dolorum quaerat?
			</p>
		</Accordion>
		<Accordion>
			<span slot="title">Accordion 2</span>
			<p>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus
				aperiam, distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error
				veritatis. Iusto, dolorum quaerat?
			</p>
		</Accordion>
	</Hst.Variant>
	<Hst.Variant title="Flush">
		<Accordion flush>
			<span slot="title">Accordion 1</span>
			<p>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus
				aperiam, distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error
				veritatis. Iusto, dolorum quaerat?
			</p>
		</Accordion>
		<Accordion flush>
			<span slot="title">Accordion 2</span>
			<p>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime nulla dolorem non accusamus
				aperiam, distinctio earum placeat debitis vel repellat ex quia aut nostrum facere error
				veritatis. Iusto, dolorum quaerat?
			</p>
		</Accordion>
	</Hst.Variant>
</Hst.Story>
