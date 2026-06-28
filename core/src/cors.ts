import type {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";
import {config} from "@sprocketbot/common";
import type {NextFunction, Request, Response} from "express";

const CORS_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const CORS_ALLOWED_HEADERS = [
    "Accept",
    "Apollo-Require-Preflight",
    "Authorization",
    "Content-Type",
    "X-Apollo-Operation-Name",
    "X-Requested-With",
];

const DEFAULT_ALLOWED_ORIGINS = [
    "https://sprocket.mlesports.gg",
    "https://www.sprocket.mlesports.gg",
    "https://app.sprocket.gg",
    "https://dev.sprocket.mlesports.gg",
    "https://staging.sprocket.mlesports.gg",
    "https://sprocket.spr.ocket.cloud",
    "https://dev.sprocket.spr.ocket.cloud",
    "https://staging.sprocket.spr.ocket.cloud",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
];

const OWNED_ORIGIN_PATTERNS = [
    /^https:\/\/([a-z0-9-]+\.)?sprocket\.mlesports\.gg$/i,
    /^https:\/\/([a-z0-9-]+\.)?sprocket\.spr\.ocket\.cloud$/i,
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
];

const normalizeOrigin = (origin: string): string => {
    const trimmed = origin.trim().replace(/\/+$/, "");
    if (!trimmed) return "";
    if (trimmed.includes("://")) return trimmed;
    if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) return `http://${trimmed}`;
    return `https://${trimmed}`;
};

const configuredAllowedOrigins = (): string[] => {
    const origins = new Set(DEFAULT_ALLOWED_ORIGINS);
    origins.add(normalizeOrigin(config.web.url));

    for (const origin of (process.env.CORS_ALLOWED_ORIGINS ?? "").split(",")) {
        const normalized = normalizeOrigin(origin);
        if (normalized) origins.add(normalized);
    }

    return [...origins].filter(Boolean);
};

const isAllowedOrigin = (origin: string): boolean => {
    const normalized = normalizeOrigin(origin);
    return configuredAllowedOrigins().includes(normalized)
        || OWNED_ORIGIN_PATTERNS.some(pattern => pattern.test(normalized));
};

const resolveOrigin = (origin: string | undefined): string | undefined => {
    if (!origin) return undefined;
    return isAllowedOrigin(origin) ? normalizeOrigin(origin) : undefined;
};

const appendVaryOrigin = (res: Response): void => {
    const existing = res.getHeader("Vary");
    if (!existing) {
        res.setHeader("Vary", "Origin");
        return;
    }

    const values = Array.isArray(existing) ? existing.join(",") : String(existing);
    if (!values.toLowerCase().split(",").map(v => v.trim()).includes("origin")) {
        res.setHeader("Vary", `${values}, Origin`);
    }
};

export const corsOptions: CorsOptions = {
    origin: (origin, callback): void => {
        if (!origin) {
            callback(null, true);
            return;
        }

        callback(null, resolveOrigin(origin) ?? false);
    },
    credentials: true,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    methods: CORS_METHODS,
    maxAge: 86400,
    optionsSuccessStatus: 204,
};

export const corsPreflightMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const allowedOrigin = resolveOrigin(req.headers.origin);

    if (allowedOrigin) {
        res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        appendVaryOrigin(res);
    }

    res.setHeader("Access-Control-Allow-Methods", CORS_METHODS.join(","));
    res.setHeader("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS.join(","));
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
        res.status(204).send();
        return;
    }

    next();
};
