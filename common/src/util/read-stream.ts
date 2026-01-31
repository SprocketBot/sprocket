import type {Readable} from "stream";

/**
 * Reads a Stream into a Buffer. Note that this will consume the data from the stream, and it will not be
 * readable in other places. You MUST use ONLY the Buffer after calling this function.
 * @param stream The stream to read.
 * @returns A buffer containing the data from the stream.
 */
export const readToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        stream.on("data", chunk => {
            chunks.push(Buffer.from(chunk as ArrayBuffer));
        });
        stream.on("error", err => {
            reject(err);
        });
        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });
};

/**
 * Reads a Stream into a string. Note that this will consume the data from the stream, and it will not be
 * readable in other places. You MUST use ONLY the string after calling this function.
 * @param stream The stream to read.
 * @returns A string containing the data from the stream.
 */
export const readToString = async (stream: Readable): Promise<string> => {
    const buffer = await readToBuffer(stream);
    return buffer.toString();
};
