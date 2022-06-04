<script lang="ts">

    import {Modal} from "$lib/components";
    import type {Player} from "../../../../api";
    export let visible = false;
    export let targetPlayer: Player | undefined;
    export let bans = [1,2,3,4] | undefined;
    let isAMercifulGod = false;
    import FaHammer from 'svelte-icons/fa/FaHammer.svelte'
    import FaPeace from 'svelte-icons/fa/FaPeace.svelte'
    import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte'
    import ToastContainer from "../../../molecules/toasts/ToastContainer.svelte";

    const showThemMercy = () => {
        isAMercifulGod = true;
        //toast
        //remove ban
    }
    const removeBan = () => {
        //remove ban
    }

</script>

<Modal title="Manage Player" id="manage-player-modal" bind:visible >
    <section slot ="body">
        <h3>Player Name</h3>
        <div>
        <table class="table text-center w-full">
            <thead>
            <tr>
                <th>Date</th>
                <th>Expires</th>
                <th>Reason</th>
                <th>Smith</th>
                <th>Anvil</th>
            </tr>
            </thead>
            <tbody>
            {#each bans as ban (ban.id)}
                <tr>
                    <td>ban.date</td>
                    <td>ban.expiration</td>
                    <td>ban.reason</td>
                    <td>ban.smith</td>
                    <td>
                        <button class="btn btn-outline float-right lg:btn-sm" on:click={() => {showThemMercy(ban.id)}}>
                            <span class="h-4">
                             <FaPeace/>
                            </span>
                        </button>
                        <button class="btn btn-outline float-right lg:btn-sm" on:click={() => {removeBan(ban.id)}}>
                            <span class="h-4">
                             <FaTrashAlt/>
                            </span>
                        </button>
                    </td>
                </tr>
            {/each}
                </tbody>
            </tbody>
        </table>
        </div>
        <div class=divider-horizontal />
        <div>
            <combo>

            </combo>
            <button>
                <FaHammer/>
            </button>
        </div>
    </section>
    <ToastContainer/>

</Modal>