import {getContext, setContext} from "svelte";
import type {CurrentScrim$result} from "$houdini";
import type {Readable} from "svelte/store";

const CurrentScrimContextKey = "CURRENT_SCRIM_CONTEXT_KEY";

export type CurrentScrimContextValue = Readable<CurrentScrim$result["getCurrentScrim"] | undefined>;

export const CurrentScrimContext = () => getContext<CurrentScrimContextValue>(CurrentScrimContextKey);
export const SetCurrentScrimContext = (v: CurrentScrimContextValue) =>
    setContext<CurrentScrimContextValue>(CurrentScrimContextKey, v);
