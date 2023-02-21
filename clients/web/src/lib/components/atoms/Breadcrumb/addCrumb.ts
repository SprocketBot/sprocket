import {getContext, setContext, hasContext} from "svelte";
import {type ICrumb, type BreadcrumbContext, BREADCRUMB_CONTEXT_KEY} from "./types";

export const addCrumb = (crumb: ICrumb) => {
    const existingContext = hasContext(BREADCRUMB_CONTEXT_KEY)
        ? getContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY)
        : [];
    setContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY, [...existingContext, crumb]);
};
