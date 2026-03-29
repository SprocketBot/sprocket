import { Foundation, LayerOne, LayerTwo } from "./refs";

export const stackLocations = [Foundation, LayerOne, LayerTwo].map(r => ({
    name: r.name,
    workDir: r.location
}))
