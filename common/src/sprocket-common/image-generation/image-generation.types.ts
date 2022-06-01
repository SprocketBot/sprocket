import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";


export enum ImageGenerationEndpoint {
    // Scrim
    GenerateImage = "GenerateImage",
}

export const ImageGenerationSchemas = {
    // Scrim Report card
    [ImageGenerationEndpoint.GenerateImage]: {
        input: Schemas.GenerateImage_Request,
        output: Schemas.GenerateImage_Response,
    },
};

export type ImageGenerationInput<T extends ImageGenerationEndpoint> = z.infer<typeof ImageGenerationSchemas[T]["input"]>;
export type ImageGenerationOutput<T extends ImageGenerationEndpoint> = z.infer<typeof ImageGenerationSchemas[T]["output"]>;

export interface ImageGenerationSuccessResponse<T extends ImageGenerationEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: ImageGenerationOutput<T>;
}

export interface ImageGenerationErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type ImageGenerationResponse<T extends ImageGenerationEndpoint> =
ImageGenerationSuccessResponse<T>
| ImageGenerationErrorResponse;

