<script lang="ts">
import type {MemberRestriction} from "../../../../api";

import {expireRestrictionMutation} from "$lib/api";
import {Modal} from "../../../atoms";

export let visible: boolean = false;
export let restriction: MemberRestriction;

let reason: string;
let forgiven: boolean;

const expireRestriction = async () => {
    try {
        await expireRestrictionMutation({
            id: restriction.id,
            expiration: new Date(),
            reason: reason,
            forgiven: forgiven,
        });

        visible = false;
    } catch {
        console.log(`Failed to cancel the restriction ${restriction.id}`);
    }
};
</script>

<Modal title="Expire Queue Ban Restriction" bind:visible id="expire-restriction-modal">
    <section slot="body">
        <div class="form-control w-full">
            <label class="label">
                <span class="label-text">Reason for Removing Restriction</span>
              </label> 
            <textarea placeholder="Because he forgot to check in..." bind:value={reason} />
        </div>

        <div class="form-control w-full">
            <label class="label cursor-pointer">
                <span class="label-text">Forgiven</span> 
                <input type="checkbox" class="toggle toggle-lg" bind:checked={forgiven} />
            </label>
        </div>

        <button on:click={expireRestriction}>Remove Restriction</button>
    </section>
</Modal>

<style lang="postcss">
    section {
        @apply flex flex-col items-center gap-3;
    }

    p {
        @apply w-full;
    }

    textarea {
        @apply textarea textarea-error w-full;
    }

    button {
        @apply btn btn-error;
    }
</style>