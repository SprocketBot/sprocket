import { z } from 'zod';

import { BallchasingResponseSchema } from './stats/ballchasing';

export const ParseReplay_Request = z.object({
  replayObjectPath: z.string(),
});

export enum Parser {
  CARBALL = 'carball',
  BALLCHASING = 'ballchasing',
}

export const ParseReplay_Response = z.object({
  parser: z.nativeEnum(Parser),
  parserVersion: z.union([z.string().transform(v => parseFloat(v)), z.number()]),
  outputPath: z.string(),
  data: BallchasingResponseSchema,
});
export type ParsedReplay = z.infer<typeof ParseReplay_Response>;
