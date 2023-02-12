import { readable } from "svelte/store";

export const MediaQuery = (query: string) => readable<boolean | undefined>(undefined, (set) => {
    const windowQuery = window.matchMedia(query)
    console.assert(query === windowQuery.media, `Media Query was not properly parsed. Expected ${query}, recieved ${windowQuery.media}`)
    const handleQueryChange = (e: MediaQueryListEvent) => {
        set(e.matches)
    }

    windowQuery.addEventListener("change", handleQueryChange)

    set(windowQuery.matches)
    
    return () => windowQuery.removeEventListener("change", handleQueryChange)
})


// Default Tailwind sm screen
// It is technically possible to import straight from the config file
// but that was a little messy
export const SmallScreenQuery = MediaQuery("(max-width: 767px)")
// Default tailwind xs screen
export const XSmallScreenQuery = MediaQuery("(max-width: 639px)")