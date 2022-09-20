import {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";

export enum CoreEndpoint {
    GetDiscordIdByUser = "GetDiscordIdByUser",
    GetSprocketConfiguration = "GetSprocketConfiguration",
    GetOrganizationProfile = "GetOrganizationProfile",
    GetUserByAuthAccount = "GetUserByAuthAccount",
    GetMember = "GetMember",
    GetPlayerByPlatformId = "GetPlayerByPlatformId",
    GetPlayersByPlatformIds = "GetPlayersByPlatformIds",
    GetOrganizationDiscordGuildsByGuild = "GetOrganizationDiscordGuildsByGuild",
    GenerateReportCard = "GenerateReportCard",
    GetOrganizationConfigurationValue = "GetOrganizationConfigurationValue",
    GetOrganizationByDiscordGuild = "GetOrganizationByDiscordGuild",
    GetFranchiseProfile = "GetFranchiseProfile",
    GetGameSkillGroupProfile = "GetGameSkillGroupProfile",
    GetScrimReportCardWebhooks = "GetScrimReportCardWebhooks",
    GetMatchReportCardWebhooks = "GetMatchReportCardWebhooks",
    GetUsersLatestScrim = "GetUsersLatestScrim",
    GetMleMatchInfoAndStakeholders = "GetMleMatchInfoAndStakeholders",
    GetGuildsByOrganizationId = "GetGuildsByOrganizationId",

    GetMatchBySubmissionId = "GetMatchBySubmissionId",
    GetMatchById = "GetMatchById",
    GetFranchiseStaff = "GetFranchiseStaff",
    GetPlayerFranchises = "GetPlayerFranchises",

    GetTransactionsDiscordWebhook = "GetTransactionsDiscordWebhook",
    GetSkillGroupWebhooks = "GetSkillGroupWebhooks",
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
    [CoreEndpoint.GetOrganizationProfile]: {
        input: Schemas.GetOrganizationProfile_Request,
        output: Schemas.GetOrganizationProfile_Response,
    },
    [CoreEndpoint.GetUserByAuthAccount]: {
        input: Schemas.GetUserByAuthAccount_Request,
        output: Schemas.GetUserByAuthAccount_Response,
    },
    [CoreEndpoint.GetMember]: {
        input: Schemas.GetMember_Request,
        output: Schemas.GetMember_Response,
    },
    [CoreEndpoint.GetPlayerByPlatformId]: {
        input: Schemas.GetPlayerByPlatformId_Request,
        output: Schemas.GetPlayerByPlatformId_Response,
    },
    [CoreEndpoint.GetPlayersByPlatformIds]: {
        input: z.array(Schemas.GetPlayerByPlatformId_Request),
        output: z.array(Schemas.GetPlayerByPlatformId_Response),
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
        input: Schemas.GetOrganizationByDiscordGuild_Request,
        output: Schemas.GetOrganizationByDiscordGuild_Response,
    },
    [CoreEndpoint.GetFranchiseProfile]: {
        input: Schemas.GetFranchiseProfile_Request,
        output: Schemas.GetFranchiseProfile_Response,
    },
    [CoreEndpoint.GetGameSkillGroupProfile]: {
        input: Schemas.GetGameSkillGroupProfile_Request,
        output: Schemas.GetGameSkillGroupProfile_Response,
    },
    [CoreEndpoint.GetScrimReportCardWebhooks]: {
        input: Schemas.GetScrimReportCardWebhooks_Request,
        output: Schemas.GetScrimReportCardWebhooks_Response,
    },
    [CoreEndpoint.GetMatchReportCardWebhooks]: {
        input: Schemas.GetMatchReportCardWebhooks_Request,
        output: Schemas.GetMatchReportCardWebhooks_Response,
    },
    [CoreEndpoint.GetUsersLatestScrim]: {
        input: Schemas.GetUsersLastScrim_Request,
        output: Schemas.GetUsersLastScrim_Response,
    },
    [CoreEndpoint.GetMleMatchInfoAndStakeholders]: {
        input: Schemas.GetMleMatchInfoAndStakeholders_Request,
        output: Schemas.GetMleMatchInfoAndStakeholders_Response,
    },
    [CoreEndpoint.GetMatchBySubmissionId]: {
        input: Schemas.GetMatchBySubmissionId_Request,
        output: Schemas.GetMatchBySubmissionId_Response,
    },
    [CoreEndpoint.GetMatchById]: {
        input: Schemas.GetMatchById_Request,
        output: Schemas.GetMatchById_Response,
    },
    [CoreEndpoint.GetFranchiseStaff]: {
        input: Schemas.GetFranchiseStaff_Request,
        output: Schemas.GetFranchiseStaff_Response,
    },
    [CoreEndpoint.GetPlayerFranchises]: {
        input: Schemas.GetPlayerFranchises_Request,
        output: Schemas.GetPlayerFranchises_Response,
    },
    [CoreEndpoint.GetTransactionsDiscordWebhook]: {
        input: Schemas.GetTransactionsDiscordWebhook_Request,
        output: Schemas.GetTransactionsDiscordWebhook_Response,
    },
    [CoreEndpoint.GetGuildsByOrganizationId]: {
        input: Schemas.GetGuildsByOrganizationId_Request,
        output: Schemas.GetGuildsByOrganizationId_Response,
    },
    [CoreEndpoint.GetSkillGroupWebhooks]: {
        input: Schemas.GetSkillGroupWebhooks_Request,
        output: Schemas.GetSkillGroupWebhooks_Response,
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
