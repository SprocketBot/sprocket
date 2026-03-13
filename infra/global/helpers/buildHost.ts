import {Config} from "@pulumi/pulumi"

export const buildHost = (...x: string[]) => {
  const c = new Config()
  const environment = c.get("subdomain")

  if (environment === "main") {
    return x.filter(Boolean).filter(t => t !== environment).join('.');
  } return x.filter(Boolean).join('.');
}
