<script lang="ts">

    import {Modal} from "$lib/components";
    import SubmitReplaysModal from "../modals/SubmitReplaysModal.svelte";
    export let visible = false;
    let submitting: boolean = false;

</script>

<Modal title="Manage Scrim" bind:visible id="manage-scrim-modal">
    <section slot ="body">
        <hr/>
        <div class="flex items-center">

            <h3 class="flex-1">Play Solo</h3>
            <div>
                <button>Join</button>
            </div>

        </div>
        <div class="divider"></div>
        <div class="flex items-center gap-2">
            <h3 class="flex-1">Play Together <span class="text-gray-300 text-sm">(Coming Soon)</span></h3>
            <button>Create group</button>
            <button>Join group</button>
        </div>
    </section>

</Modal>

<!--<style lang="postcss">-->
<!--    form {-->
<!--        @apply space-y-4;-->

<!--    hr {-->
<!--        @apply col-span-2;-->
<!--    }-->

<!--    label {-->
<!--        @apply contents;-->
<!--    }-->

<!--    select {-->
<!--        @apply mt-2 outline-1 select select-bordered select-sm;-->

<!--    option {-->
<!--        @apply py-2;-->
<!--    }-->

<!--    &:disabled {-->
<!--         @apply bg-gray-700 cursor-not-allowed;-->
<!--     }-->
<!--    }-->

<!--    input {-->
<!--        @apply ml-auto;-->
<!--    }-->

<!--    input:disabled {-->
<!--        @apply text-right px-4 py-1 bg-gray-700;-->
<!--    }-->
<!--    }-->
<!--</style>-->
