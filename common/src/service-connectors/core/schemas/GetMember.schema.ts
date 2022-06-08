import {z} from "zod";

import {MemberSchema} from "../types";

export const GetMember_Request = z.number();

export const GetMember_Response = MemberSchema;

export type GetMemberResponse = z.infer<typeof GetMember_Response>;
