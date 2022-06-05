import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";

enum MemberRestrictionType {
    QUEUE_BAN = "QUEUE_BAN",
    RATIFICATION_BAN = "RATIFICATION_BAN",
}

enum MemberRestrictionEventType {
    RESTRICTED = 1,
    UNRESTRICTED = 2,
}

interface MemberProfile {
    name: string;
}

interface Member {
    profile: MemberProfile;
}

export interface MemberRestrictionEvent {
    id: number;

    eventType: number;

    message?: string;

    restriction: {
        type: MemberRestrictionType;

        expiration: Date;

        reason: string;

        member: Member;

        manualExpiration?: Date;

        manualExpirationReason?: string;

        memberId: number;
    };
}

export interface RestrictedPlayersStoreValue {
    getActiveMemberRestrictions: MemberRestrictionEvent[];
}

export interface RestrictedPlayersSubscriptionValue {
    followRestrictedMembers: MemberRestrictionEvent;
}

export interface RestrictedPlayersStoreVariables {
}

export interface RestrictedPlayersStoreSubscriptionVariables {
}

export class RestrictedPlayersStore extends LiveQueryStore<RestrictedPlayersStoreValue, RestrictedPlayersStoreVariables, RestrictedPlayersSubscriptionValue, RestrictedPlayersStoreSubscriptionVariables> {
    protected queryString = gql<RestrictedPlayersStoreValue, RestrictedPlayersStoreVariables>`
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

    protected subscriptionString = gql<RestrictedPlayersSubscriptionValue, RestrictedPlayersStoreSubscriptionVariables>`
        subscription {
            followRestrictedMembers {
                id
                eventType
                message
                restriction {
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
            }
        }
    `;

    constructor() {
        super();
        this.vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<RestrictedPlayersSubscriptionValue, RestrictedPlayersStoreSubscriptionVariables>): void => {
        if (message?.data) {
            if (!this.currentValue.data?.getActiveMemberRestrictions) {
                console.log(this.currentValue);
                console.warn("Received subscription before query completed!");
                return;
            }

            switch (message.data.followRestrictedMembers.eventType) {
                case MemberRestrictionEventType.RESTRICTED:
                    this.currentValue.data.getActiveMemberRestrictions.push(message.data.followRestrictedMembers);
                    break;
                case MemberRestrictionEventType.UNRESTRICTED:
                    this.currentValue.data.getActiveMemberRestrictions = this.currentValue.data.getActiveMemberRestrictions.filter(s => s.id !== message.data?.followRestrictedMembers.id);
                    break;
                default:
                    console.log("This path shouldn't be hit.");
            }

            this.pub();
        }
    };
}

export const restrictedPlayers = new RestrictedPlayersStore();
