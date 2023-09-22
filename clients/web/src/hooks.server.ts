import type {Handle, HandleServerError} from "@sveltejs/kit";
import {sequence} from "@sveltejs/kit/hooks";
import {HoudiniSessionHook} from "./hooks/HoudiniSession.hook";

export const handle: Handle = sequence(HoudiniSessionHook);
export const handleError: HandleServerError = ({error, event}) => {
    return {
        message: "An Error has occurred!",
    };
};
