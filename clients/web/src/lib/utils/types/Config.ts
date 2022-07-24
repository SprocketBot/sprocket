export interface Config {
    gqlUrl: string;

    secure: boolean;

    chatwoot: {
        enabled: boolean;
        url: string;
        websiteToken: string;
    };
}
