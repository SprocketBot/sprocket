import {LayerOne, LayerTwo} from "./refs";    IngressNetwork: "xrh1xjmgji8zohvw2m3taxpio"

export const stackLocations = [LayerOne, LayerTwo].map(r => ({
    name: r.name,
    workDir: r.location
}))