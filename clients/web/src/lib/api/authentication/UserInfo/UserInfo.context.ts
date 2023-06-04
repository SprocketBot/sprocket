import {getContext, setContext} from "svelte";
import type {UserInfo$result} from "$houdini";
import type {Readable} from "svelte/store";

const UserInfoContextKey = "UserInfo_CONTEXT_KEY";

export type UserInfoContextValue = Readable<UserInfo$result["me"] | undefined>;

export const UserInfoContext = () => getContext<UserInfoContextValue>(UserInfoContextKey);
export const SetUserInfoContext = (v: UserInfoContextValue) => setContext<UserInfoContextValue>(UserInfoContextKey, v);
