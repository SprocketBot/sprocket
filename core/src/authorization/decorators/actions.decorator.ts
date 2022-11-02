import {applyDecorators, SetMetadata, UseGuards} from "@nestjs/common";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {MetadataKeys} from "../authorization.types";
import {ActionGuard} from "../guards/action.guard";

export type ActionsOperator = (memberActions: string[]) => boolean;

export function ActionsOr(...actions: Array<string | ActionsOperator>): ActionsOperator {
    return (memberActions: string[]) =>
        actions.some(action => {
            if (action instanceof Function) return action(memberActions);
            return memberActions.includes(action);
        });
}

export function ActionsAnd(...actions: Array<string | ActionsOperator>): ActionsOperator {
    return (memberActions: string[]) =>
        actions.every(action => {
            if (action instanceof Function) return action(memberActions);
            return memberActions.includes(action);
        });
}

/**
 * Requires a member to have the permission to do provided actions. Acts as an OR for root paramteres.
 * @param actions List of strings representing actions or action operators. Acts as an OR.
 * @example
 * // Requires "DoSomething" OR "DoSomethingElse"
 * Actions("DoSomething", "DoSomethingElse")
 * @example
 * // Requires "DoSomething" OR "DoSomethingElse"
 * Actions(ActionsOr("DoSomething", "DoSomethingElse"))
 * @example
 * // Requires "DoSomething" AND "DoSomethingElse"
 * Actions(ActionsAnd("DoSomething", "DoSomethingElse"))
 * @example
 * // Requires "DoSomething" AND ("DoSomethingElse" OR "OrElseDoThing")
 * Actions(ActionsAnd("DoSomething", ActionsOr("DoSomethingElse", "OrElseDoThing")))
 * @example
 * // Requires "DoSomething" OR ("DoSomethingElse" AND "OrElseDoThing")
 * Actions("DoSomething", ActionsAnd("DoSomethingElse", "OrElseDoThing"))
 * @example
 * // Requires "DoSomething" OR ("DoSomethingElse" AND "OrElseDoThing")
 * Actions(ActionsOr("DoSomething", ActionsAnd("DoSomethingElse", "OrElseDoThing")))
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Actions(...actions: Array<string | ActionsOperator>): (...decorators: any[]) => void {
    return applyDecorators(SetMetadata(MetadataKeys.Actions, actions), UseGuards(GraphQLJwtAuthGuard, ActionGuard));
}
