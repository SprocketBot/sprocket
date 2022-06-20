<script lang="ts">
	import { setContext } from "svelte";
	import type { Writable } from "svelte/store";

	import EditLayout from "./components/layouts/EditLayout.svelte";
	import { indicatorBounds, previewEl, selectedEl } from "./stores";
	import type { BoundBox } from "./types";
	import Tailwindcss from "./utils/Tailwindcss.svelte";

	setContext<Writable<SVGElement>>("previewEl", previewEl);
	setContext<Writable<BoundBox>>("indicatorBounds", indicatorBounds);
	setContext<Writable<SVGElement>>("selectedEl", selectedEl);
</script>

<Tailwindcss />
<EditLayout />
