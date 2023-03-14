import type {Action} from "../../database/authorization/action";
import type {ModelDataOnly} from "../../database/base-model";

export const ActionFixtures: Array<ModelDataOnly<Action>> = [
    {code: "users.delete", description: ""},
];
