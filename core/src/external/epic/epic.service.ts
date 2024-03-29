import {Injectable} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import axios from "axios";
import {compareAsc} from "date-fns";
import now from "lodash.now";

import type {EpicProfile} from "./epic.types";
import {EpicAccessTokenSchema, EpicProfileSchema} from "./epic.types";

@Injectable()
export class EpicService {
    private readonly tokenEndpoint = "https://api.epicgames.dev/epic/oauth/v1/token";

    private readonly accountsEndpoint = "https://api.epicgames.dev/epic/id/v1/accounts";

    private readonly accessTokens: Record<string, {expiration: Date; token: string} | undefined> = {};

    private async getAccessToken(clientId: string, secret: string): Promise<string> {
        const cachedToken = this.accessTokens[clientId];
        if (cachedToken && compareAsc(cachedToken.expiration, now()) > 0) return cachedToken.token;

        const basicAuthToken = Buffer.from(`${clientId}:${secret}`).toString("base64");
        const accessTokenRequest = await axios.post(
            this.tokenEndpoint,
            {
                grant_type: "client_credentials",
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `basic ${basicAuthToken}`,
                },
            },
        );

        const accessToken = EpicAccessTokenSchema.safeParse(accessTokenRequest.data);
        if (!accessToken.success) throw new Error("Failed to fetch bearer token");

        this.accessTokens[clientId] = {
            expiration: accessToken.data.expires_at,
            token: accessToken.data.access_token,
        };
        return accessToken.data.access_token;
    }

    private async getRLToken(): Promise<string> {
        return this.getAccessToken(config.auth.epic.rlClientId, config.auth.epic.rlSecret);
    }

    async getSprocketToken(): Promise<string> {
        return this.getAccessToken(config.auth.epic.clientId, config.auth.epic.secret);
    }

    async getProfile(
        data:
            | {displayName: string}
            | {accountId: string}
            | {identityProviderId: "xbl" | "steam" | "psn"; externalAccountId: string},
    ): Promise<EpicProfile | null> {
        const params = new URLSearchParams(data);
        const profileRequest = await axios.get(`${this.accountsEndpoint}?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${await this.getRLToken()}`,
            },
        });

        const epicProfile = EpicProfileSchema.array().safeParse(profileRequest.data);
        if (!epicProfile.success) throw new Error("Failed to parse profile");

        if (epicProfile.data.length !== 1) return null;
        return epicProfile.data[0];
    }
}
