import {z} from "zod";

export enum SkillGroup {
    FOUNDATION = 0,
    ACADEMY = 1,
    CHAMPION = 2,
    MASTER = 3,
    PREMIER = 4,
}

export const NewPlayerSchema = z.object({
    id: z.number(),
    name: z.string(),
    salary: z.number(),
    skillGroup: z.nativeEnum(SkillGroups),
    elo: z.number(),
});

export type NewPlayer = z.infer<typeof NewPlayerSchema>;

export const AddPlayers_Input = z.array(NewPlayerSchema);

export const AddPlayers_Output = z.object({});
