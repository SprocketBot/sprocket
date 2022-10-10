<script lang="ts">
    import {getContext} from "svelte";
    import {MODAL_CLOSE_CONTEXT_KEY} from "./Modal.svelte";

    const closeModal = getContext(MODAL_CLOSE_CONTEXT_KEY);
</script>

<button on:click={closeModal}>Close!</button>
