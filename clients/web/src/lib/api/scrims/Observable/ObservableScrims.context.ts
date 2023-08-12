import {getContext, setContext} from "svelte";
import type {ObservableScrims$result} from "$houdini";
import type {Readable} from "svelte/store";

const ObservableScrimsContextKey = "OPEN_SCRIMS_CONTEXT_KEY";

export type ObservableScrimsContextValue = Readable<ObservableScrims$result["getAvailableScrims"] | undefined>;

export const ObservableScrimsContext = () => getContext<ObservableScrimsContextValue>(ObservableScrimsContextKey);
export const SetObservableScrimsContext = (v: ObservableScrimsContextValue) =>
    setContext<ObservableScrimsContextValue>(ObservableScrimsContextKey, v);
