import { SprocketStackDefinition } from "./types";

export enum FoundationExports {
    DropletId = "DropletId",
    DropletName = "DropletName",
    PublicIp = "PublicIp",
    ReservedIp = "ReservedIp",
    FirewallId = "FirewallId",
    DeployUser = "DeployUser",
    NodeTags = "NodeTags",
    DnsNames = "DnsNames",
    SshKeyFingerprints = "SshKeyFingerprints",
    BootstrapMode = "BootstrapMode",
    SwarmBootstrap = "SwarmBootstrap",
    ReservedIpAssignmentId = "ReservedIpAssignmentId",
    DnsRecordIds = "DnsRecordIds",
}

export default new SprocketStackDefinition("foundation", `${__dirname}/../../foundation`);
