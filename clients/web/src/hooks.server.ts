import type {Handle} from "@sveltejs/kit";
import {sequence} from "@sveltejs/kit/hooks";
import {HoudiniSessionHook} from "./hooks/HoudiniSession.hook";

export const handle: Handle = sequence(HoudiniSessionHook);
