import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

type NamedEnvironment = "dev-staging" | "prod" | string;

interface SharedEnvironmentConfig {
    region: string;
    size: string;
    dnsZone: string;
    hostnameLabel: string;
    image?: string;
    dnsPrefixes?: string[];
    adminCidrs: string[];
    sshPublicKey?: string;
    sshKeyFingerprints?: string[];
    tags?: string[];
    deployUser?: string;
    createReservedIp?: boolean;
    enableIpv6?: boolean;
    enableMonitoring?: boolean;
    dropletName?: string;
    vpcUuid?: string;
    swarmCidrs?: string[];
    ghcrUsername?: string;
    ghcrToken?: string;
}

interface SharedStackConfig {
    environments: Record<string, SharedEnvironmentConfig>;
    sharedDockerNetworks?: {
        ingress?: string;
        platform?: string;
        monitoring?: string;
    };
    sharedSecretNames?: string[];
}

interface SharedNodeOutputs {
    dropletId: pulumi.Output<string>;
    dropletName: pulumi.Output<string>;
    publicIp: pulumi.Output<string>;
    reservedIp: pulumi.Output<string | null>;
    firewallId: pulumi.Output<string>;
    deployUser: string;
    nodeTags: string[];
    dnsNames: string[];
    sshKeyFingerprints: pulumi.Output<string[]>;
    bootstrapMode: string;
    swarmBootstrap: pulumi.Output<string>;
    reservedIpAssignmentId: pulumi.Output<string | null>;
    dnsRecordIds: pulumi.Output<string>[];
}

const config = new pulumi.Config();
const stackConfig = config.requireObject<SharedStackConfig>("stack");

const sharedDockerNetworks = {
    ingress: stackConfig.sharedDockerNetworks?.ingress ?? "traefik",
    platform: stackConfig.sharedDockerNetworks?.platform ?? "platform",
    monitoring: stackConfig.sharedDockerNetworks?.monitoring ?? "monitoring",
};

const sharedSecretNames = stackConfig.sharedSecretNames ?? [];

const nodes: Record<string, SharedNodeOutputs> = {};

for (const [environment, environmentConfig] of Object.entries(stackConfig.environments)) {
    nodes[environment] = createSharedNode(environment, environmentConfig);
}

export const FoundationNodes = Object.fromEntries(
    Object.entries(nodes).map(([environment, node]) => [environment, {
        dropletId: node.dropletId,
        dropletName: node.dropletName,
        publicIp: node.publicIp,
        reservedIp: node.reservedIp,
        firewallId: node.firewallId,
        deployUser: node.deployUser,
        nodeTags: node.nodeTags,
        dnsNames: node.dnsNames,
        sshKeyFingerprints: node.sshKeyFingerprints,
        bootstrapMode: node.bootstrapMode,
        swarmBootstrap: node.swarmBootstrap,
        reservedIpAssignmentId: node.reservedIpAssignmentId,
        dnsRecordIds: node.dnsRecordIds,
    }]),
);

export const SharedDockerNetworks = sharedDockerNetworks;
export const SharedSecretNames = sharedSecretNames;
export const SharedIngressNetworkName = sharedDockerNetworks.ingress;
export const SharedPlatformNetworkName = sharedDockerNetworks.platform;
export const SharedMonitoringNetworkName = sharedDockerNetworks.monitoring;

function createSharedNode(environment: NamedEnvironment, environmentConfig: SharedEnvironmentConfig): SharedNodeOutputs {
    const image = environmentConfig.image ?? "ubuntu-24-04-x64";
    const dnsPrefixes = parseStringList(environmentConfig.dnsPrefixes, ["", "api", "vault", "traefik"]);
    const adminCidrs = parseStringList(environmentConfig.adminCidrs);
    const sshPublicKey = environmentConfig.sshPublicKey;
    const sshKeyFingerprints = parseStringList(environmentConfig.sshKeyFingerprints);
    const tags = parseStringList(environmentConfig.tags, ["sprocket", environment, "node"]);
    const deployUser = environmentConfig.deployUser ?? "deploy";
    const createReservedIp = environmentConfig.createReservedIp ?? (environment === "prod");
    const enableIpv6 = environmentConfig.enableIpv6 ?? true;
    const enableMonitoring = environmentConfig.enableMonitoring ?? true;
    const dropletName = environmentConfig.dropletName ?? `sprocket-${environment}`;
    const dropletTags = dedupe(tags.concat([`sprocket-${environment}`, `${environment}-node`]));
    const swarmCidrs = parseStringList(environmentConfig.swarmCidrs);

    if (adminCidrs.length === 0) {
        throw new Error(`infra-shared: stack.environments.${environment}.adminCidrs must define at least one SSH source CIDR.`);
    }

    if (!sshPublicKey && sshKeyFingerprints.length === 0) {
        throw new Error(`infra-shared: stack.environments.${environment} must set sshPublicKey or sshKeyFingerprints.`);
    }

    const sshKey = sshPublicKey
        ? new digitalocean.SshKey(`${environment}-ssh-key`, {
            name: `${dropletName}-access`,
            publicKey: sshPublicKey,
        })
        : undefined;

    const allSshFingerprints: pulumi.Input<string>[] = [
        ...sshKeyFingerprints,
        ...(sshKey ? [sshKey.fingerprint] : []),
    ];

    for (const tagName of dropletTags) {
        new digitalocean.Tag(`${environment}-${tagName}`, { name: tagName });
    }

    const cloudInit = renderCloudInit({
        deployUser,
        sshPublicKey,
        ghcrUsername: environmentConfig.ghcrUsername,
        ghcrToken: pulumi.output(environmentConfig.ghcrToken),
    });

    const droplet = new digitalocean.Droplet(`${environment}-node`, {
        name: dropletName,
        region: environmentConfig.region,
        size: environmentConfig.size,
        image,
        ipv6: enableIpv6,
        monitoring: enableMonitoring,
        tags: dropletTags,
        sshKeys: allSshFingerprints,
        userData: cloudInit,
        vpcUuid: environmentConfig.vpcUuid,
    });

    const reservedIp = createReservedIp
        ? new digitalocean.ReservedIp(`${environment}-reserved-ip`, {
            region: environmentConfig.region,
        })
        : undefined;

    const reservedIpAssignment = reservedIp
        ? new digitalocean.ReservedIpAssignment(`${environment}-reserved-ip-assignment`, {
            ipAddress: reservedIp.ipAddress,
            dropletId: droplet.id.apply(id => Number(id)),
        }, { dependsOn: [droplet] })
        : undefined;

    const publicIp = reservedIp ? reservedIp.ipAddress : droplet.ipv4Address;

    const recordNames = dedupe(dnsPrefixes.map(prefix => joinDnsName(prefix, environmentConfig.hostnameLabel)));
    const dnsRecords = recordNames.map((recordName, index) => new digitalocean.DnsRecord(`${environment}-dns-${index}`, {
        domain: environmentConfig.dnsZone,
        type: "A",
        name: recordName,
        value: publicIp,
        ttl: 300,
    }));

    const firewall = new digitalocean.Firewall(`${environment}-firewall`, {
        name: `${dropletName}-firewall`,
        tags: dropletTags,
        inboundRules: [
            {
                protocol: "tcp",
                portRange: "22",
                sourceAddresses: adminCidrs,
            },
            {
                protocol: "tcp",
                portRange: "80",
                sourceAddresses: ["0.0.0.0/0", "::/0"],
            },
            {
                protocol: "tcp",
                portRange: "443",
                sourceAddresses: ["0.0.0.0/0", "::/0"],
            },
            ...buildSwarmInboundRules(swarmCidrs),
        ],
        outboundRules: [
            {
                protocol: "tcp",
                portRange: "1-65535",
                destinationAddresses: ["0.0.0.0/0", "::/0"],
            },
            {
                protocol: "udp",
                portRange: "1-65535",
                destinationAddresses: ["0.0.0.0/0", "::/0"],
            },
            {
                protocol: "icmp",
                destinationAddresses: ["0.0.0.0/0", "::/0"],
            },
        ],
    });

    return {
        dropletId: droplet.id,
        dropletName: droplet.name,
        publicIp: pulumi.output(publicIp),
        reservedIp: pulumi.output(reservedIp?.ipAddress ?? null),
        firewallId: firewall.id,
        deployUser,
        nodeTags: dropletTags,
        dnsNames: recordNames.map(recordName => `${recordName}.${environmentConfig.dnsZone}`),
        sshKeyFingerprints: pulumi.output(allSshFingerprints),
        bootstrapMode: "cloud-init",
        swarmBootstrap: pulumi.interpolate`docker swarm init on first boot for ${droplet.name}`,
        reservedIpAssignmentId: pulumi.output(reservedIpAssignment?.id ?? null),
        dnsRecordIds: dnsRecords.map(record => record.id),
    };
}

function buildSwarmInboundRules(cidrs: string[]): digitalocean.types.input.FirewallInboundRule[] {
    if (cidrs.length === 0) {
        return [];
    }

    return [
        {
            protocol: "tcp",
            portRange: "2377",
            sourceAddresses: cidrs,
        },
        {
            protocol: "tcp",
            portRange: "7946",
            sourceAddresses: cidrs,
        },
        {
            protocol: "udp",
            portRange: "7946",
            sourceAddresses: cidrs,
        },
        {
            protocol: "udp",
            portRange: "4789",
            sourceAddresses: cidrs,
        },
    ];
}

function renderCloudInit(args: {
    deployUser: string;
    sshPublicKey?: string;
    ghcrUsername?: string;
    ghcrToken: pulumi.Output<string | undefined>;
}): pulumi.Output<string> {
    return pulumi.all([args.ghcrToken]).apply(([token]) => {
        const sshAuthorizedKeys = args.sshPublicKey
            ? `      ssh_authorized_keys:\n        - ${yamlString(args.sshPublicKey)}\n`
            : "";

        const rootDockerConfig = args.ghcrUsername && token
            ? renderDockerConfigJson(args.ghcrUsername, token)
            : undefined;

        const writeFiles = [
            {
                path: "/etc/docker/daemon.json",
                permissions: "0644",
                owner: "root:root",
                content: `{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}`,
            },
            {
                path: "/usr/local/bin/bootstrap-sprocket-node.sh",
                permissions: "0755",
                owner: "root:root",
                content: renderBootstrapScript(args.deployUser),
            },
            ...(rootDockerConfig ? [{
                path: "/root/.docker/config.json",
                permissions: "0600",
                owner: "root:root",
                content: rootDockerConfig,
            }, {
                path: `/home/${args.deployUser}/.docker/config.json`,
                permissions: "0600",
                owner: `${args.deployUser}:${args.deployUser}`,
                content: rootDockerConfig,
            }] : []),
        ];

        return `#cloud-config
package_update: true
package_upgrade: true
users:
  - default
  - name: ${args.deployUser}
    shell: /bin/bash
    groups: [sudo, docker]
    sudo: ["ALL=(ALL) NOPASSWD:ALL"]
${sshAuthorizedKeys}write_files:
${writeFiles.map(renderWriteFile).join("\n")}
runcmd:
  - [bash, /usr/local/bin/bootstrap-sprocket-node.sh]
final_message: "Sprocket foundation bootstrap finished after $UPTIME seconds"
`;
    });
}

function renderBootstrapScript(deployUser: string): string {
    return `#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg jq
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \${VERSION_CODENAME} stable" >/etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable docker
systemctl restart docker

mkdir -p /home/${deployUser}/.docker
chown -R ${deployUser}:${deployUser} /home/${deployUser}/.docker

if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q '^active$'; then
  PUBLIC_IP="$(curl -fsS http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address || true)"
  PRIVATE_IP="$(hostname -I | awk '{print $1}')"
  SWARM_ADDR="\${PRIVATE_IP:-\${PUBLIC_IP:-127.0.0.1}}"
  docker swarm init --advertise-addr "\${SWARM_ADDR}" || true
fi
`;
}

function renderWriteFile(file: {
    path: string;
    permissions: string;
    owner: string;
    content: string;
}): string {
    return `  - path: ${file.path}
    permissions: "${file.permissions}"
    owner: ${file.owner}
    content: |
${indent(file.content, 6)}`;
}

function renderDockerConfigJson(username: string, token: string): string {
    const auth = Buffer.from(`${username}:${token}`).toString("base64");
    return `{
  "auths": {
    "ghcr.io": {
      "auth": "${auth}"
    }
  }
}`;
}

function yamlString(value: string): string {
    return JSON.stringify(value);
}

function indent(value: string, spaces: number): string {
    const prefix = " ".repeat(spaces);
    return value
        .split("\n")
        .map(line => `${prefix}${line}`)
        .join("\n");
}

function joinDnsName(prefix: string, hostnameLabel: string): string {
    return prefix ? `${prefix}.${hostnameLabel}` : hostnameLabel;
}

function parseStringList(values: string[] | undefined, fallback: string[] = []): string[] {
    return values ? [...values] : [...fallback];
}

function dedupe(values: string[]): string[] {
    return Array.from(new Set(values));
}
