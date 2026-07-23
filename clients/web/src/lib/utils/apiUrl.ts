import type {Config} from "./types";

// eslint-disable-next-line no-confusing-arrow
const withLeadingSlash = (path: string): string => path.startsWith("/") ? path : `/${path}`;

export const apiUrl = (
    clientConfig: Config["client"],
    path: string,
): string => {
    const normalizedPath = withLeadingSlash(path);
    const configuredUrl = clientConfig.gqlUrl.trim().replace(/\/+$/, "");

    if (configuredUrl.includes("://")) {
        const url = new URL(configuredUrl);
        const basePath = url.pathname === "/graphql" ? "" : url.pathname.replace(/\/+$/, "");
        url.pathname = `${basePath}${normalizedPath}`;
        url.search = "";
        url.hash = "";
        return url.toString();
    }

    return `http${clientConfig.secure ? "s" : ""}://${configuredUrl}${normalizedPath}`;
};

export const wsApiUrl = (
    clientConfig: Config["client"],
    path: string,
): string => apiUrl(clientConfig, path).replace(/^http/, "ws");
