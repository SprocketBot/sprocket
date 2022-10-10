import {z} from "zod";

import {SkillGroupProfileSchema} from "../types";

export const GetGameSkillGroupProfile_Request = z.object({
    skillGroupId: z.number(),
});

export const GetGameSkillGroupProfile_Response = SkillGroupProfileSchema;
