import {writable} from "svelte/store";
import type {
    BoundBox, ElementsMap, ImageType, PropertiesMap,
} from "$src/types";
import {WorkState} from "$src/types";

export const imageType = writable<ImageType>(undefined);

export const imageTypeId = writable<string>("");
export const filename = writable<string>("");

export const indicatorBounds = writable<BoundBox>({
    x: -100,
    y: -100,
    w: 0,
    h: 0,
});
export const workstate = writable<WorkState>(WorkState.Linking);
export const previewEl = writable<SVGElement>(undefined);
export const selectedEl = writable<SVGElement>(undefined);
export const links = writable<ElementsMap>(new Map<SVGElement, PropertiesMap>());
export const fontElements = writable<Map<string, Element>>(new Map());


export const saving = writable<boolean>(false);
export const uploadStatus = writable<string>("");
export const uploadProgress = writable<number>(0);
export const downloadStatus = writable<string>("");
export const downloadProgress = writable<number>(0);
