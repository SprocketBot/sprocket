import { getContext, setContext } from "svelte";
import { type ICrumb, type BreadcrumbContext, BREADCRUMB_CONTEXT_KEY } from "./types";

export const addCrumb = (crumb: ICrumb) => setContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY, [...getContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY), crumb])
