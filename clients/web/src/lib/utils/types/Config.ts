export type Stack = "local" | "dev" | "staging" | "main";

export interface Config {
    client: {
        gqlUrl: string;

        secure: boolean;

        stack: Stack;
    };
    server: {
        stack: Stack;
    };
}