import type {EndpointOutput} from "@sveltejs/kit";

export async function GET(): Promise<EndpointOutput> {
    return {
        headers: {Location: "/"},
        status: 302,
    };
}
