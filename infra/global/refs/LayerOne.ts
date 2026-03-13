import {SprocketStackDefinition} from "./types";

export enum LayerOneExports {
    IngressNetwork = "IngressNetwork",
}

export default new SprocketStackDefinition("layer_1", `${__dirname}/../../layer_1`);