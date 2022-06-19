import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";
import {GetOrganizationByDiscordGuild_Request, GetOrganizationByDiscordGuild_Response} from "./schemas/GetOrganizationByDiscordGuild.schema";

export enum CoreEndpoint {
    GetDiscordIdByUser = "GetDiscordIdByUser",
    GetSprocketConfiguration = "GetSprocketConfiguration",
    GetOrganizationBranding = "GetOrganizationBranding",
    GetUserByAuthAccount = "GetUserByAuthAccount",
    GetMember = "GetMember",
    GetOrganizationDiscordGuildsByGuild = "GetOrganizationDiscordGuildsByGuild",
    GenerateReportCard = "GenerateReportCard",
    GetOrganizationConfigurationValue = "GetOrganizationConfigurationValue",
    GetOrganizationByDiscordGuild = "GetOrganizationByDiscordGuild",
}

export const CoreSchemas = {
    [CoreEndpoint.GetDiscordIdByUser]: {
        input: Schemas.GetDiscordIdByUser_Request,
        output: Schemas.GetDiscordIdByUser_Response,
    },
    [CoreEndpoint.GetSprocketConfiguration]: {
        input: Schemas.GetSprocketConfiguration_Request,
        output: Schemas.GetSprocketConfiguration_Response,
    },
    [CoreEndpoint.GetOrganizationBranding]: {
        input: Schemas.GetOrganizationBranding_Request,
        output: Schemas.GetOrganizationBranding_Response,
    },
    [CoreEndpoint.GetUserByAuthAccount]: {
        input: Schemas.GetUserByAuthAccount_Request,
        output: Schemas.GetUserByAuthAccount_Response,
    },
    [CoreEndpoint.GetMember]: {
        input: Schemas.GetMember_Request,
        output: Schemas.GetMember_Response,
    },
    [CoreEndpoint.GetOrganizationDiscordGuildsByGuild]: {
        input: Schemas.GetOrganizationDiscordGuildsByGuild_Request,
        output: Schemas.GetOrganizationDiscordGuildsByGuild_Response,
    },
    [CoreEndpoint.GenerateReportCard]: {
        input: Schemas.GenerateReportCard_Request,
        output: Schemas.GenerateReportCard_Response,
    },
    [CoreEndpoint.GetOrganizationConfigurationValue]: {
        input: Schemas.GetOrganizationConfigurationValue_Request,
        output: Schemas.GetOrganizationConfigurationValue_Response,
    },
    [CoreEndpoint.GetOrganizationByDiscordGuild]: {
        input: GetOrganizationByDiscordGuild_Request,
        output: GetOrganizationByDiscordGuild_Response,
    },
};

export type CoreInput<T extends CoreEndpoint> = z.infer<typeof CoreSchemas[T]["input"]>;
export type CoreOutput<T extends CoreEndpoint> = z.infer<typeof CoreSchemas[T]["output"]>;

export interface CoreSuccessResponse<T extends CoreEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: CoreOutput<T>;
}

export interface CoreErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type CoreResponse<T extends CoreEndpoint> = CoreSuccessResponse<T> | CoreErrorResponse;
