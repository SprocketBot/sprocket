import type {Readable} from "stream";

/**
 * Reads a Stream into a Buffer. Note that this will consume the data from the stream, and it will not be
 * readable in other places. You MUST use ONLY the Buffer after calling this function.
 * @param stream The stream to read.
 * @returns A buffer containing the data from the stream.
 */
export const read = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", chunk => { chunks.push(Buffer.from(chunk as ArrayBuffer)) });
        stream.on("error", err => { reject(err) });
        stream.on("end", () => { resolve(Buffer.concat(chunks)) });
    });
};
