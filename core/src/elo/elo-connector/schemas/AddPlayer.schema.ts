import {z} from "zod";

export enum SkillGroups {
    FOUNDATION = 1,
    ACADEMY = 2,
    CHAMPION = 3,
    MASTER = 4,
    PREMIER = 5,
    NONE = 6,
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
