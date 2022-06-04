import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";

enum MemberRestrictionType {
    QUEUE_BAN = "QUEUE_BAN",
    RATIFICATION_BAN = "RATIFICATION_BAN",
}

interface MemberProfile {
    name: string;
}

interface Member {
    profile: MemberProfile;
}

export interface MemberRestrictionEvent {
    id: number;

    message?: string;

    type: MemberRestrictionType;

    expiration: Date;

    reason: string;

    member: Member;

    manualExpiration?: Date;

    manualExpirationReason?: string;

    memberId: number;
}

export interface BannedPlayersStoreValue {
    getActiveMemberRestrictions: MemberRestrictionEvent[];
}

export interface BannedPlayersSubscriptionValue {
    followBannedMembers: MemberRestrictionEvent;
}

export interface BannedPlayersStoreVariables {
}

export interface BannedPlayersStoreSubscriptionVariables {
}

export class BannedPlayersStore extends LiveQueryStore<BannedPlayersStoreValue, BannedPlayersStoreVariables, BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables> {
    protected queryString = gql<BannedPlayersStoreValue, BannedPlayersStoreVariables>`
    query {
        getActiveMemberRestrictions(type: QUEUE_BAN) {
          id
          type
          expiration
          reason
          member {
            profile {
              name
            }
          }
          memberId
        }
    }`;

    protected subscriptionString = gql<BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables>`
    subscription {
      followBannedMembers {
        id
        message
        type
        expiration
        reason
        memberId
      }
    }
    `;

    constructor() {
        super();
        this.vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables>): void => {
        if (message?.data) {
            if (!this.currentValue.data?.getActiveMemberRestrictions) {
                console.log(this.currentValue);
                console.warn("Received subscription before query completed!");
                return;
            }

            switch (message.data.followBannedMembers.id) {
                case 1:
                    this.currentValue.data.getActiveMemberRestrictions.push(message.data.followBannedMembers);
                    break;
                case 2:
                    this.currentValue.data.getActiveMemberRestrictions = this.currentValue.data.getActiveMemberRestrictions.filter(s => s.memberId !== message.data?.event.memberId);
                    break;
                default:
                    console.log("This is path shouldn't be hit.");
            }
            
            this.pub();
        }
    };
}

export const bannedPlayers = new BannedPlayersStore();
