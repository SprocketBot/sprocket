import {z} from "zod";

export enum SkillGroup {
    PREMIER = 1,
    MASTER = 2,
    CHAMPION = 3,
    ACADEMY = 4,
    FOUNDATION = 5,
}

export const NewPlayerSchema = z.object({
    id: z.number(),
    name: z.string(),
    salary: z.number(),
    skillGroup: z.nativeEnum(SkillGroup),
    elo: z.number(),
});

export type NewPlayer = z.infer<typeof NewPlayerSchema>;

export const AddPlayers_Input = z.array(NewPlayerSchema);

export const AddPlayers_Output = z.object({});
