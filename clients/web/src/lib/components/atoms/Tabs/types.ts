import type {SvelteComponent, ComponentProps} from "svelte";
import type {IconSource} from "@steeze-ui/svelte-icon/types";

export type TabItem<T extends SvelteComponent = SvelteComponent> = {
    component: T;
    props: ComponentProps<T>;
    icon?: IconSource;
};

export type TabItems = Record<string, TabItem>;
