import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "../../core/LiveQueryStore";
import type {CurrentScrim} from "./CurrentScrim.store";

interface LFSScrimsData {
    LFSScrims: CurrentScrim[];
}

interface LFSScrimsVars {}

interface LFSScrimsSubscriptionValue {
    LFSScrim: CurrentScrim;
}

interface LFSScrimsSubscriptionVars {}

export class LFSScrimsStore extends LiveQueryStore<
LFSScrimsData,
LFSScrimsVars,
LFSScrimsSubscriptionValue,
LFSScrimsSubscriptionVars
> {
    protected queryString = gql<LFSScrimsData, LFSScrimsVars>`
    query {
      LFSScrims: getLFSScrims {
        id
        submissionId
        playerCount
        maxPlayers
        status
        createdAt
        skillGroup {
          profile {
            description
          }
        }
        currentGroup {
          code
          players
        }
        gameMode {
          description
          game {
            title
          }
        }
        settings {
          competitive
          mode
        }
        players {
          id
          name
          checkedIn
        }
        lobby {
          name
          password
        }
        games {
          teams {
            players {
              id
              name
            }
          }
        }
      }
    }
  `;

    protected subscriptionString = gql<LFSScrimsSubscriptionValue, LFSScrimsSubscriptionVars>`
    subscription {
      LFSScrim: followLFSScrims {
        id
        playerCount
        maxPlayers
        status
        createdAt
        gameMode {
          description
          game {
            title
          }
        }
        settings {
          competitive
          mode
        }
        skillGroup {
          profile {
            description
          }
        }
      }
    }
  `;

    protected _subVars: LFSScrimsSubscriptionVars = {};

    constructor() {
        super();
        // No variables needed
        this._vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<LFSScrimsSubscriptionValue, LFSScrimsSubscriptionVars>) => {
        if (!message.data) {
            console.warn(`Recieved erroneous message from followLFSScrims: ${message.error}`);
            return;
        }
        if (!this.currentValue.data) {
            console.warn(`Recieved subscription before query completed!`);
            return;
        }
        const scrim = message.data.LFSScrim;
        const existingScrims = [...this.currentValue.data.LFSScrims];
        const existingScrim = existingScrims.findIndex(s => s.id === scrim.id);
        if (existingScrim >= 0) {
            existingScrims[existingScrim] = scrim;
        } else {
            existingScrims.push(scrim);
        }

        this.currentValue.data.LFSScrims = existingScrims;
        this.pub();
    };
}
