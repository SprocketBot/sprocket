import {z} from "zod";

export const ScrimLobbySchema = z.object({
    name: z.string(),
    password: z.string(),
});

export type ScrimLobby = z.infer<typeof ScrimLobbySchema>;
