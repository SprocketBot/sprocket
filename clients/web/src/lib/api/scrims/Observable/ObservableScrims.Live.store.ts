import {readable, type Readable} from "svelte/store";
import type {ObservableScrims$result, ObservableScrimsStore, ObservableScrimsSubStore} from "$houdini";

export const ObservableScrimsLiveStore = (
    queryStore: ObservableScrimsStore,
    subStore: ObservableScrimsSubStore,
): Readable<ObservableScrims$result["getAvailableScrims"]> => {
    let value: ObservableScrims$result["getAvailableScrims"] = [];

    return readable<ObservableScrims$result["getAvailableScrims"]>([], set => {
        const queryUnsub = queryStore.subscribe($queryResult => {
            if ($queryResult.data?.getAvailableScrims) {
                value = $queryResult.data?.getAvailableScrims;
                set(value);
            }
        });
        const subUnsub = subStore.subscribe($subscriptionMessage => {
            const updatedScrim = $subscriptionMessage.data?.followPendingScrims;
            if (!updatedScrim) return;

            if (updatedScrim.status !== "PENDING") {
                // We only want pending scrims
                value = value.filter(v => v.id !== updatedScrim.id);
            } else {
                // Scrim is pending; so we can either update or replace the existing one
                const existingIndex = value.findIndex(s => s.id === updatedScrim?.id);
                if (existingIndex < 0) {
                    value.push(updatedScrim);
                } else {
                    value[existingIndex] = updatedScrim;
                }
            }

            set(value);
        });

        return () => {
            queryUnsub();
            subUnsub();
        };
    });
};
