import {readable, type Readable} from "svelte/store";
import type {CurrentScrim$result, CurrentScrimStore, CurrentScrimSub$result, CurrentScrimSubStore} from "$houdini";

export const CurrentScrimLiveStore = (
    queryStore: CurrentScrimStore,
    subStore: CurrentScrimSubStore,
    eventMap?: Partial<Record<CurrentScrimSub$result["followCurrentScrim"]["event"], () => void>>,
): Readable<CurrentScrim$result["getCurrentScrim"]> => {
    return readable<CurrentScrim$result["getCurrentScrim"]>(null, set => {
        const queryUnsub = queryStore.subscribe($q => {
            if ($q.data?.getCurrentScrim) {
                set($q.data?.getCurrentScrim);
            }
        });
        const subUnsub = subStore.subscribe($s => {
            const eventName = $s.data?.followCurrentScrim.event;
            if (eventName) {
                const handler = eventMap?.[eventName];
                if (handler) handler();
            }
            if ($s.data) {
                if (["EMPTY", "CANCELLED", "COMPLETE"].includes($s.data.followCurrentScrim.scrim.status)) {
                    // Scrim end states
                    console.log("Scrim has ended");
                    set(null);
                } else {
                    set($s.data.followCurrentScrim.scrim);
                }
            }
        });

        return () => {
            queryUnsub();
            subUnsub();
        };
    });
};
