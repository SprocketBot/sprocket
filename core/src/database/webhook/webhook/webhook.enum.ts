import {registerEnumType} from "@nestjs/graphql";

export enum WebhookType {
    ScrimReportCard = "ScrimReportCard",
    MatchReportCard = "MatchReportCard",
    SubmissionReadyForRatification = "SubmissionReadyForRatification",
    ScrimCreated = "ScrimCreated",
}

registerEnumType(WebhookType, {name: "WebhookType"});
