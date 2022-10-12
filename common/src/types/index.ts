import {z} from "zod";

export const DateSchema = z.preprocess(arg => {
    if (typeof arg === "string") {
        return new Date(arg);
    }
    return arg;
}, z.date());
