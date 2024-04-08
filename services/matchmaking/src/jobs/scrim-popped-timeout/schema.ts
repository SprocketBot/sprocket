import { Output, object, string } from 'valibot';

export const ScrimPoppedTimeoutQueue = 'ScrimPoppedTimeoutQueue';

export const ScrimPoppedTimeoutPayloadSchema = object({
  scrimId: string(),
});

export type ScrimPoppedTimeoutPayload = Output<
  typeof ScrimPoppedTimeoutPayloadSchema
>;
