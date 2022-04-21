import {readFileSync} from "fs";
import type {App} from "@sveltejs/kit";

export default JSON.parse(readFileSync("./src/config.json").toString()) as App.Session;
