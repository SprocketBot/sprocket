export interface Config {
    client: {
        gqlUrl: string;
    
        secure: boolean;
    
        chatwoot: {
            enabled: boolean;
            url: string;
            websiteToken: string;
        };
    };
    server: {
        chatwoot: {
            hmacKey: string;
        };
    };
}
