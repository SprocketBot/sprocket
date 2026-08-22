import {z} from "zod";

export const MockCompletion_Request = z.object({
    submissionId: z.string(),
    // We use z.any() here because the structure of the replay result is complex
    // and we want to be flexible for testing different parser versions/outputs.
    results: z.array(z.any()),
});

export type MockCompletion_Request = z.infer<typeof MockCompletion_Request>;

export const MockCompletion_Response = z.boolean();
export type MockCompletion_Response = z.infer<typeof MockCompletion_Response>;
