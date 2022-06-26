import type {EndpointOutput} from "@sveltejs/kit";

export async function get(): Promise<EndpointOutput> {
    return {
        headers: {Location: "/"},
        status: 302,
    };
}
