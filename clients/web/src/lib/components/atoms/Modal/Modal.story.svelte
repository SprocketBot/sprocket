<script lang="ts">
  import type { Hst as _Hst } from '@histoire/plugin-svelte';
  import Modal from './Modal.svelte';

  export let Hst: _Hst;

  let open = false;
</script>

<Hst.Story title="Atoms/Modal" layout={{type: "grid", width: 800}}>
	<Hst.Variant title="Default" {open}>
		<button on:click={() => open = true}>Open the Modal</button>
		<Modal bind:open>
			<h3 class="text-xl font-semibold text-white" slot="header">
				Terms of Service
			</h3>
			<p class="text-base leading-relaxed text-gray-400">
				With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,
				companies around the world are updating their terms of service agreements to comply.
			</p>
			<p class="text-base leading-relaxed text-gray-400">
				The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to
				ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as
				possible of high-risk data breaches that could personally affect them.
			</p>
			<svelte:fragment slot="footer">
				<button type="button"
								class="text-gray-600 focus:ring-2 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-primary-500 hover:bg-primary-600 focus:ring-gray-500">
					I accept
				</button>
				<button type="button"
								class="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 focus:z-10
											bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">
					Decline
				</button>
			</svelte:fragment>
		</Modal>
	</Hst.Variant>

	<Hst.Variant title="PopUp modal" {open}>
		<button on:click={() => open = true}>Open the Modal</button>
		<Modal bind:open>
			<div class="p-6 text-center">
				<svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none"
						 stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this
					product?</h3>
				<button type="button"
								class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
					Yes, I'm sure
				</button>
				<button type="button"
								class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
					No, cancel
				</button>
			</div>
		</Modal>
	</Hst.Variant>
</Hst.Story>
