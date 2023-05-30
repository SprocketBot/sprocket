import { readable, type Readable } from "svelte/store"
import type { OpenScrims$result, OpenScrimsStore, OpenScrimsSubStore } from "$houdini"

export const OpenScrimsLiveStore = (queryStore: OpenScrimsStore, subStore: OpenScrimsSubStore): Readable<OpenScrims$result["getAvailableScrims"]> => {
    let value: OpenScrims$result["getAvailableScrims"] = []

    return readable<OpenScrims$result["getAvailableScrims"]>([], (set) => {
        const queryUnsub = queryStore.subscribe($queryResult => {
            if ($queryResult.data?.getAvailableScrims) {
                value = $queryResult.data?.getAvailableScrims
                set(value)
            }
        })
        const subUnsub = subStore.subscribe($subscriptionMessage => {
            const updatedScrim = $subscriptionMessage.data?.followPendingScrims
            if (!updatedScrim) return

            if (updatedScrim.status !== "PENDING") {
                // We only want pending scrims
                value = value.filter(v => v.id !== updatedScrim.id)
            } else {
                // Scrim is pending; so we can either update or replace the existing one
                const existingIndex = value.findIndex(s => s.id === updatedScrim?.id)
                if (existingIndex < 0) {
                    value.push(updatedScrim)
                } else {
                    value[existingIndex] = updatedScrim
                }    
            }


            set(value)
        })

        return () => {
            queryUnsub()
            subUnsub()
        }
    })
}