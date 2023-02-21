import type {IconSource} from "@steeze-ui/svelte-icon/types";

export const BREADCRUMB_CONTEXT_KEY = "BREADCRUMB_CONTEXT_KEY";

export interface ICrumb {
    icon?: IconSource;
    label: string;
    target: string;
}

export type BreadcrumbContext = ICrumb[];
