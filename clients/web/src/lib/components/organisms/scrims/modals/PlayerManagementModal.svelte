<script lang="ts">
    import {Modal} from "$lib/components";
    import {createRestrictionMutation, getMemberByUserIdQuery} from "$lib/api";
    import FaHammer from "svelte-icons/fa/FaHammer.svelte";

    export let visible = false;

    export let playerId: number;

    let buttonEnabled = true;
    let expirationDuration: number = 0;
    let reason: string;

    async function createBan() {
        buttonEnabled = false;
        // toast
        // remove ban
        try {
            const memberRequest = await getMemberByUserIdQuery({id: playerId, orgId: 1});
            const memberId = memberRequest.id ?? 0;
            const duration = expirationDuration * 1000 * 60 * 60; // n hours in ms
            await createRestrictionMutation({
                memberId: memberId,
                reason: reason,
                expiration: new Date(Date.now() + duration),
            });
            visible = false;
        } catch (e) {
            console.warn(e);
        } finally {
            buttonEnabled = true;
        }
    }
</script>

<Modal title="Ban Delivery Service" bind:visible id="ban-player-modal">
    <form on:submit|preventDefault={createBan} slot="body">
        <div class="divider"></div>

        <h4>Choose {playerId}'s Fate:</h4>

        <div class="form-control">
            <label class="label">
                <span class="label-text">Ban Duration</span>
            </label>
            <select bind:value={expirationDuration}>
                <option disabled selected> Make a Selection</option>
                <option value={12}> 12 Hours</option>
                <option value={24}> 24 Hours</option>
                <option value={72}> 72 Hours</option>

            </select>
        </div>

        <div class="form-control">
            <label class="label">
                <span class="label-text">Reason:</span>
            </label>
            <input bind:value={reason} class="textarea" required id="ban-reason" placeholder="Provide Ban Reason:"/>
        </div>

        <div class="divider"/>

        <button class="btn btn-primary btn-wide flex mx-auto mb-4" disabled={!buttonEnabled}>
            <span class="h-10"><FaHammer/></span>
        </button>
    </form>

</Modal>

<style lang="postcss">
    form {
        @apply space-y-4;


        label {
            @apply contents;
        }

        select {
            @apply mt-2 outline-1 select select-bordered select-sm;

            option {
                @apply py-2;
            }

            &:disabled {
                @apply bg-gray-700 cursor-not-allowed;
            }
        }

        input {
            @apply ml-auto;
        }

        input:disabled {
            @apply text-right px-4 py-1 bg-gray-700;
        }
    }
</style>
