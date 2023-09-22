import {Bolt, Calendar, Home} from "@steeze-ui/heroicons";
import type {NavTreeItem} from "../../../lib/components/layouts/Dashboard/types";

export const NavTree: NavTreeItem[] = [
    {
        label: "Home",
        icon: Home,
        pathPart: "",
    },
    {divider: true},
    {
        label: "Scrims",
        icon: Bolt,
        pathPart: "scrims",
        children: [
            {
                label: "Play",
                pathPart: "play",
            },
            {
                label: "Observe",
                pathPart: "observe",
            },
        ],
    },
    {
        label: "League Play",
        icon: Calendar,
        pathPart: "league",
    },
    {divider: true},
];
