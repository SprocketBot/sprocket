import { Output, object, string } from 'valibot';

export const ScrimPendingTimeoutQueue = 'ScrimPoppedTimeoutQueue';

export const ScrimPendingTimeoutPayloadSchema = object({
  scrimId: string(),
});

export type ScrimPendingTimeoutPayload = Output<
  typeof ScrimPendingTimeoutPayloadSchema
>;
