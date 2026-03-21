import * as pulumi from "@pulumi/pulumi";

interface ServiceDeploymentConfig {
    enabled?: boolean;
    image?: {
        repository: string;
        tag?: string;
    };
    replicas?: number;
    env?: Record<string, string>;
    resources?: {
        memoryBytes?: number;
        cpuNanoCpus?: number;
    };
}

interface ServicesStackConfig {
    environment: string;
    domainName: string;
    sharedStack: string;
    defaultImageTag?: string;
    services?: Record<string, ServiceDeploymentConfig>;
}

const DEFAULT_SERVICE_NAMES = [
    "core",
    "web",
    "discord-bot",
    "image-generation-frontend",
    "image-generation-service",
    "matchmaking-service",
    "notification-service",
    "replay-parse-service",
    "server-analytics-service",
    "submission-service",
    "elo-service",
];

const config = new pulumi.Config();
const stackConfig = config.requireObject<ServicesStackConfig>("stack");
const shared = new pulumi.StackReference(stackConfig.sharedStack);
const defaultImageTag = stackConfig.defaultImageTag ?? "latest";

const normalizedServices = Object.fromEntries(
    DEFAULT_SERVICE_NAMES.map(serviceName => {
        const serviceConfig = stackConfig.services?.[serviceName];
        return [serviceName, {
            enabled: serviceConfig?.enabled ?? true,
            repository: serviceConfig?.image?.repository ?? serviceName,
            imageTag: serviceConfig?.image?.tag ?? defaultImageTag,
            replicas: serviceConfig?.replicas ?? 1,
            env: serviceConfig?.env ?? {},
            resources: {
                memoryBytes: serviceConfig?.resources?.memoryBytes ?? null,
                cpuNanoCpus: serviceConfig?.resources?.cpuNanoCpus ?? null,
            },
        }];
    }),
);

export const Environment = stackConfig.environment;
export const DomainName = stackConfig.domainName;
export const SharedStackName = stackConfig.sharedStack;
export const SharedIngressNetworkName = shared.getOutput("SharedIngressNetworkName");
export const SharedPlatformNetworkName = shared.getOutput("SharedPlatformNetworkName");
export const SharedMonitoringNetworkName = shared.getOutput("SharedMonitoringNetworkName");
export const FoundationNodes = shared.getOutput("FoundationNodes");
export const ServiceDeploymentPlan = normalizedServices;
