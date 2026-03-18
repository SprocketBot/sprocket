import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

const config = new pulumi.Config();

const environment = config.require("environment");
const region = config.require("region");
const size = config.require("size");
const image = config.get("image") ?? "ubuntu-24-04-x64";
const dnsZone = config.require("dns-zone");
const hostnameLabel = config.require("hostname-label");
const dnsPrefixes = parseStringList(config.get("dns-prefixes"), ["", "api", "vault", "traefik"]);
const adminCidrs = parseStringList(config.get("admin-cidrs"));
const sshPublicKey = config.get("ssh-public-key");
const sshKeyFingerprints = parseStringList(config.get("ssh-key-fingerprints"));
const tags = parseStringList(config.get("tags"), ["sprocket", environment, "node"]);
const deployUser = config.get("deploy-user") ?? "deploy";
const createReservedIp = config.getBoolean("create-reserved-ip") ?? (environment === "prod");
const enableIpv6 = config.getBoolean("enable-ipv6") ?? true;
const enableMonitoring = config.getBoolean("enable-monitoring") ?? true;
const dropletName = config.get("droplet-name") ?? `sprocket-${environment}`;
const dropletTags = dedupe(tags.concat([`sprocket-${environment}`, `${environment}-node`]));
const vpcUuid = config.get("vpc-uuid");
const swarmCidrs = parseStringList(config.get("swarm-cidrs"));
const ghcrUsername = config.get("ghcr-username");
const ghcrToken = config.getSecret("ghcr-token");

if (adminCidrs.length === 0) {
    throw new Error("foundation:admin-cidrs must define at least one SSH source CIDR.");
}

if (!sshPublicKey && sshKeyFingerprints.length === 0) {
    throw new Error("Set foundation:ssh-public-key or foundation:ssh-key-fingerprints before provisioning a node.");
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
    new digitalocean.Tag(tagName, { name: tagName });
}

const cloudInit = renderCloudInit({
    deployUser,
    sshPublicKey,
    ghcrUsername,
    ghcrToken: pulumi.output(ghcrToken),
});

const droplet = new digitalocean.Droplet(`${environment}-node`, {
    name: dropletName,
    region,
    size,
    image,
    ipv6: enableIpv6,
    monitoring: enableMonitoring,
    tags: dropletTags,
    sshKeys: allSshFingerprints,
    userData: cloudInit,
    vpcUuid,
});

const reservedIp = createReservedIp
    ? new digitalocean.ReservedIp(`${environment}-reserved-ip`, {
        region,
    })
    : undefined;

const reservedIpAssignment = reservedIp
    ? new digitalocean.ReservedIpAssignment(`${environment}-reserved-ip-assignment`, {
        ipAddress: reservedIp.ipAddress,
        dropletId: droplet.id.apply(id => Number(id)),
    }, { dependsOn: [droplet] })
    : undefined;

const publicIp = reservedIp
    ? reservedIp.ipAddress
    : droplet.ipv4Address;

const recordNames = dedupe(dnsPrefixes.map(prefix => joinDnsName(prefix, hostnameLabel)));
const dnsRecords = recordNames.map((recordName, index) => new digitalocean.DnsRecord(`${environment}-dns-${index}`, {
    domain: dnsZone,
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

export const DropletId = droplet.id;
export const DropletName = droplet.name;
export const PublicIp = publicIp;
export const ReservedIp = reservedIp?.ipAddress ?? null;
export const FirewallId = firewall.id;
export const DeployUser = deployUser;
export const NodeTags = dropletTags;
export const DnsNames = recordNames.map(recordName => `${recordName}.${dnsZone}`);
export const SshKeyFingerprints = pulumi.output(allSshFingerprints);
export const BootstrapMode = "cloud-init";
export const SwarmBootstrap = pulumi.interpolate`docker swarm init on first boot for ${droplet.name}`;
export const ReservedIpAssignmentId = reservedIpAssignment?.id ?? null;
export const DnsRecordIds = dnsRecords.map(record => record.id);

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
    deployUser: string
    sshPublicKey?: string
    ghcrUsername?: string
    ghcrToken: pulumi.Output<string | undefined>
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

mkdir -p /etc/docker
if [ -f /etc/docker/daemon.json ]; then
  systemctl daemon-reload || true
fi
systemctl enable docker
systemctl restart docker

if id -u ${deployUser} >/dev/null 2>&1; then
  usermod -aG docker ${deployUser} || true
  mkdir -p /home/${deployUser}/.docker
  chown -R ${deployUser}:${deployUser} /home/${deployUser}/.docker
fi

mkdir -p /etc/sprocket
touch /etc/sprocket/bootstrap-started

if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q '^active$'; then
  advertise_addr="$(curl -fsS http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address || hostname -I | awk '{print $1}')"
  docker swarm init --advertise-addr "$advertise_addr"
fi

touch /etc/sprocket/bootstrap-complete
`;
}

function renderDockerConfigJson(username: string, token: string): string {
    const auth = Buffer.from(`${username}:${token}`).toString("base64");
    return JSON.stringify({
        auths: {
            "ghcr.io": {
                auth,
            },
        },
    }, null, 2);
}

function renderWriteFile(file: {
    path: string
    permissions: string
    owner: string
    content: string
}): string {
    return `  - path: ${file.path}
    permissions: "${file.permissions}"
    owner: ${file.owner}
    content: |
${indentBlock(file.content, 6)}`;
}

function indentBlock(content: string, spaces: number): string {
    const indent = " ".repeat(spaces);
    return content
        .split("\n")
        .map(line => `${indent}${line}`)
        .join("\n");
}

function joinDnsName(prefix: string, hostnameLabel: string): string {
    const trimmedPrefix = prefix.trim();
    return trimmedPrefix ? `${trimmedPrefix}.${hostnameLabel}` : hostnameLabel;
}

function parseStringList(raw: string | undefined, fallback: string[] = []): string[] {
    if (!raw) {
        return fallback;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
        return fallback;
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return dedupe(parsed.filter((value): value is string => typeof value === "string" && value.trim().length > 0));
        }
    } catch {
        // Fall back to comma/newline-separated config.
    }

    return dedupe(trimmed
        .split(/\r?\n|,/)
        .map(value => value.trim())
        .filter(Boolean));
}

function dedupe(values: pulumi.Input<string>[]): string[] {
    const result: string[] = [];

    for (const value of values) {
        if (typeof value !== "string") {
            continue;
        }

        if (!result.includes(value)) {
            result.push(value);
        }
    }

    return result;
}

function yamlString(value: string): string {
    return JSON.stringify(value);
}
