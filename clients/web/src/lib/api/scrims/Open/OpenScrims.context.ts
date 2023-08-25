import {getContext, setContext} from "svelte";
import type {OpenScrims$result} from "$houdini";
import type {Readable} from "svelte/store";

const OpenScrimsContextKey = "OPEN_SCRIMS_CONTEXT_KEY";

export type OpenScrimsContextValue = Readable<OpenScrims$result["getAvailableScrims"] | undefined>;

export const OpenScrimsContext = () => getContext<OpenScrimsContextValue>(OpenScrimsContextKey);
export const SetOpenScrimsContext = (v: OpenScrimsContextValue) =>
    setContext<OpenScrimsContextValue>(OpenScrimsContextKey, v);
