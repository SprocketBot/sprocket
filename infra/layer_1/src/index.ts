import {Traefik} from "global/services";

export const ingress = new Traefik("traefik", {
    staticConfigurationPath: `${__dirname}/config/traefik/static.yaml`
});
