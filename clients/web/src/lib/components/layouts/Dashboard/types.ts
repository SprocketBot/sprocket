import type {IconSource} from "@steeze-ui/svelte-icon/types";

export type NavTreeItem =
    | {
          label: string;
          icon?: IconSource;
          pathPart: string;
          children?: NavTreeItem[];
      }
    | {divider: true};
