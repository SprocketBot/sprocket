import {apiUrl} from "./apiUrl";
import type {Config} from "./types";

const config = (gqlUrl: string, secure = false): Config["client"] => ({
    gqlUrl,
    secure,
    chatwoot: {enabled: false, url: "", websiteToken: ""},
    stack: "main",
});

describe("apiUrl", () => {
    it("builds a URL for a bare hostname", () => {
        expect(apiUrl(config("sprocket.mlesports.gg", true), "/graphql"))
            .toBe("https://sprocket.mlesports.gg/graphql");
    });

    it("builds a URL for an insecure hostname", () => {
        expect(apiUrl(config("localhost:3001"), "/graphql"))
            .toBe("http://localhost:3001/graphql");
    });

    it("adds a leading slash to the path", () => {
        expect(apiUrl(config("localhost:3001"), "graphql"))
            .toBe("http://localhost:3001/graphql");
    });

    it("handles a gqlUrl that already includes a scheme and path", () => {
        expect(apiUrl(config("https://sprocket.mlesports.gg/graphql", true), "/refresh"))
            .toBe("https://sprocket.mlesports.gg/refresh");
    });

    it("strips trailing slashes from the configured host", () => {
        expect(apiUrl(config("sprocket.mlesports.gg/", true), "/graphql"))
            .toBe("https://sprocket.mlesports.gg/graphql");
    });
});