import {gql} from "@urql/core";
import {client} from "../client";

export interface ReportMemberPlatformAccountVariables {
    userId: number;
    organizationId: number;
    tracker: string;
    platform: string;
    platformId: string;
}

export interface ReportMemberPlatformAccountResponse {
    reportMemberPlatformAccount: string;
}

const mutationString = gql`
    mutation ReportMemberPlatformAccount(
        $userId: Int!
        $organizationId: Int!
        $tracker: String!
        $platform: String!
        $platformId: String!
    ) {
        reportMemberPlatformAccount(
            sprocketUserId: $userId
            organizationId: $organizationId
            tracker: $tracker
            platform: $platform
            platformId: $platformId
        )
    }
`;

export const reportMemberPlatformAccountMutation = async (vars: ReportMemberPlatformAccountVariables): Promise<ReportMemberPlatformAccountResponse> => {
    const r = await client.mutation<ReportMemberPlatformAccountResponse, ReportMemberPlatformAccountVariables>(mutationString, vars).toPromise();
    if (r.data) {
        return r.data;
    }
    throw r.error as Error;
};
