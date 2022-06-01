import {readFileSync} from "fs";

export default JSON.parse(readFileSync("./src/config.json").toString()) as App.Session;
