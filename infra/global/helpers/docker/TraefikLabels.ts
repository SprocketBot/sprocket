import * as pulumi from "@pulumi/pulumi"
import { HOSTNAME } from "../../constants";
const config = new pulumi.Config()


export class TraefikLabels {
    private output: { label: string, value: string }[] = [{
        label: "traefik.enable", value: "true"
    }]

    constructor(readonly name: string, readonly type: "http" | "tcp" = "http") {
    }

    get complete(): { label: string, value: string }[] {
        return this.output;
    }

    private get routerPrefix() {
        return `traefik.${this.type}.routers.${this.name}`
    }

    private get servicePrefix() {
        return `traefik.${this.type}.services.${this.name}`
    }

    private get middlewarePrefix() {
        return `traefik.${this.type}.middlewares.${this.name}`
    }

    rule(rule: string): TraefikLabels {
        this.output.push(this.routerLabel("rule", rule))

        return this;
    }

    service(service: string): TraefikLabels {
        this.output.push(this.routerLabel("service", service))
        return this;
    }

    entryPoints(entryPoints: string): TraefikLabels {
        this.output.push(this.routerLabel("entryPoints", entryPoints))
        return this;
    }

    tls(certResolver: string): TraefikLabels {
        if (config.getBoolean("no-tls")) return this;
        this.output.push(this.routerLabel("tls", "true"));
        this.output.push(this.routerLabel("tls.certResolver", certResolver))
        return this;
    }

    targetPort(port: number): TraefikLabels {
        this.output.push(this.serviceLabel("loadbalancer.server.port", port.toString()))
        return this;
    }

    forwardAuthRule(rule: string): TraefikLabels {
        this.output.push({
            label: `${this.middlewarePrefix}.forwardauth.address`,
            value: `https://fa.${HOSTNAME}/login${rule ? `?rule=${rule}` : ""}`
        })
        if (!this.output.some(l => l.label.endsWith("middlewares"))) {
            this.output.push(this.routerLabel("middlewares", this.name))
        }
        return this
    }

    private routerLabel(key: string, value: string): { label: string, value: string } {
        return {
            label: `${this.routerPrefix}.${key}`,
            value: value
        }
    }

    private serviceLabel(key: string, value: string): { label: string, value: string } {
        return {
            label: `${this.servicePrefix}.${key}`,
            value: value
        }
    }
}
