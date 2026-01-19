export type Stack = 'local' | 'dev' | 'staging' | 'main';

export interface Config {
  client: {
    gqlUrl: string;

    secure: boolean;

    chatwoot: {
      enabled: boolean;
      url: string;
      websiteToken: string;
    };

    stack: Stack;
  };
  server: {
    chatwoot: {
      hmacKey: string;
    };

    stack: Stack;
  };
}
