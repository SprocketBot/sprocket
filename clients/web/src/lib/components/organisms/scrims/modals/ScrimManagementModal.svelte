<script lang="ts">
    /*

     */

    // import type {GamesAndModesValue} from "$lib/api";

    // import {gamesAndModes} from "$lib/api/queries/GamesAndModes.store";
    import {Modal} from "$lib/components";

    export let visible = false;



    // let game: GamesAndModesValue["games"][0];
    // let mode: GamesAndModesValue["games"][0]["modes"][0];
    // let scrimType: "BEST_OF" | "ROUND_ROBIN";
    // let competitive: boolean = true;
    // let observable: boolean = true;
    //
    // let buttonEnabled = true;

    // async function createScrim() {
    //     buttonEnabled = false;
    //     try {
    //         await createScrimMutation({
    //             settings: {
    //                 gameModeId: mode.id,
    //                 mode: scrimType,
    //                 competitive: competitive,
    //                 observable: observable,
    //             },
    //         });
    //         visible = false;
    //     } finally {
    //         buttonEnabled = true;
    //     }
    // }
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
        <div class="divider">or</div>
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
