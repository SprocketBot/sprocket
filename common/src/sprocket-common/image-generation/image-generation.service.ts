/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Inject, Injectable, Logger,
} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";

import {CommonClient, ResponseStatus} from "../../global.types";
import type {
  ImageGenerationEndpoint, ImageGenerationInput, ImageGenerationResponse,
} from "./image-generation.types";
import {ImageGenerationSchemas} from "./image-generation.types";

@Injectable()
export class ImageGenerationService {
  private logger = new Logger(ImageGenerationService.name);

  constructor(@Inject(CommonClient.ImageGeneration) private microserviceClient: ClientProxy) {}

  async send<E extends ImageGenerationEndpoint>(endpoint: E, data: ImageGenerationInput<E>): Promise<ImageGenerationResponse<E>> {
      this.logger.debug(`Sending message to endpoint=${endpoint} with data=${JSON.stringify(data)}`);

      const {input: inputSchema, output: outputSchema} = ImageGenerationSchemas[endpoint];

      try {
          const input = inputSchema.parse(data);

          const rx = this.microserviceClient.send(endpoint, input);

          const response = await lastValueFrom(rx) as unknown;

          const output = outputSchema.parse(response);
          this.logger.debug(`Replying from endpoint=${endpoint} with response=${JSON.stringify(response)}`);
          return {
              status: ResponseStatus.SUCCESS,
              data: output,
          };
      } catch (e) {
          return {
              status: ResponseStatus.ERROR,
              error: e as Error,
          };
      }
  }

  parseInput<E extends ImageGenerationEndpoint>(endpoint: E, data: unknown): ImageGenerationInput<E> {
      const {input: inputSchema} = ImageGenerationSchemas[endpoint];
      return inputSchema.parse(data);
  }
}
