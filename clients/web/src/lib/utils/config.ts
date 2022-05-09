import {readFileSync} from "fs";
import type {Session} from "$lib";

export default JSON.parse(readFileSync("./src/config.json").toString()) as Session;
