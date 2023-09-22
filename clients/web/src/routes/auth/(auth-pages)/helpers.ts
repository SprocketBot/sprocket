import {goto} from "$app/navigation";
import {SelectActiveOrganizationStore} from "$houdini";
import {updateAuthCookies} from "$lib/api";

export const next = (defaultRoute: string, keepNext?: boolean) => {
    const location = new URL(window.location.href);

    if (location.searchParams.has("next") && !keepNext && location.searchParams.get("next")) {
        // We can safely make this assertion; because of the .has above
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextString = location.searchParams.get("next")!;
        // Split into parts
        const nextParts = nextString.split(",");
        // Get the most immediate path
        const nextPath = nextParts.pop();
        // Build the query back together
        const nextQuery = nextParts.join(",");
        // Route
        goto(`${nextPath}?next=${nextQuery}`, {invalidateAll: true});
    } else {
        // There is no next; go to the specific route.
        goto(defaultRoute, {invalidateAll: true});
    }
};

export const selectOrganization = async (orgId: number, opts?: {next?: string; accessTokenOverride?: string}) => {
    const selector = new SelectActiveOrganizationStore();
    const {next: nextUrl, accessTokenOverride} = opts ?? {};
    try {
        const result = await selector.mutate({orgId}, {metadata: {accessTokenOverride}});

        if (!result.data)
            throw new Error(result.errors?.map(e => e.message).join(", ") ?? "Failed to fetch user organizations");

        updateAuthCookies(result.data.switchOrganization);

        if (nextUrl) next(nextUrl);
        return true;
    } catch (e) {
        console.warn("Failed to select organization", e);
        return false;
    }
};
