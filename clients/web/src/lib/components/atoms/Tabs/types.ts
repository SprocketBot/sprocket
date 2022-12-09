import type {SvelteComponent, ComponentProps} from "svelte";
import type {IconSource} from "@steeze-ui/svelte-icon/types";

// export type TabItem = {
//   component: SvelteComponent,
//   key: string,
//   props: ComponentProps<SvelteComponent>
// }

export type TabItem<T extends SvelteComponent = SvelteComponent> = {
    component: T;
    props: ComponentProps<T>;
    icon?: IconSource;
};

export type TabItems = {
    [key: string]: TabItem;
};
