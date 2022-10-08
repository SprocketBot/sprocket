import type {RequestHandler} from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    return {
        headers: {Location: "/"},
        status: 302,
    };
};
