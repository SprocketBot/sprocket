import {applyDecorators, SetMetadata, UseGuards} from "@nestjs/common";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {MetadataKeys} from "../authorization.types";
import {ActionGuard} from "../guards/action.guard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Actions(...actions: string[]): (...decorators: any[]) => void {
    return applyDecorators(SetMetadata(MetadataKeys.Actions, actions), UseGuards(GraphQLJwtAuthGuard, ActionGuard));
}
