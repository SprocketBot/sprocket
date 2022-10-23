import {readFileSync} from "fs";

export const JwtConstants = {
    secret: readFileSync("./secret/jwtSecret.txt").toString().trim(),
};
