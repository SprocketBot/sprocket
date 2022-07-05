import type {Readable} from "stream";

export const readableToString = async (file: Readable): Promise<string> => new Promise((resolve, reject) => {
    const output: string[] = [];
    file.on("data", (chunk: Buffer) => {
        output.push(chunk.toString());
    });
    file.on("error", reject);
    file.on("end", () => {
        resolve(output.join(""));
    });
});
