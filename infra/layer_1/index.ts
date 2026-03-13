import * as src from "./src";
import {LayerOneExports} from "global/refs"

module.exports = {
    [LayerOneExports.IngressNetwork]: src.ingress.networkId,
}