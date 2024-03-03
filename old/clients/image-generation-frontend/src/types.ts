export type SVGProperty = "text" | "fill" | "stroke" | "image";

export enum WorkState {
    Linking = "Linking",
    Fonts = "Fonts",
    Saving = "Saving",
}
export type TemplateVariable = string;
export interface BoundBox {
    w: number;
    h: number;
    x: number;
    y: number;
}

export interface OptionType {
    name: string;
    displayName: string;
    options: (string|number)[];
    default: string | number;
}
export type OptionsRecord = Record<SVGProperty, OptionType[]>;

export interface TemplateLeafNode {
    description: string;
    type: string;
}

export interface SprocketData {
    varPath: TemplateVariable;
    options: Record<string, string>;
    type: SVGProperty;
}


export interface Filter {
    code: string;
    description: string;
    name: string;
    query: string;
}

export interface FilterValues extends Filter {
    data: any;
}

export interface ItemTypeQuery {
    filters: Filter[];
    query: string;
}

export interface ImageTypeItem {
    displayName: string;
    reportCode: string;
    description: string;
}

export interface ImageType extends ImageTypeItem {
    query: ItemTypeQuery;
    templateStructure: any;
}

export type ElementsMap = Map<SVGElement, PropertiesMap>;
export type PropertiesMap = Map<SVGProperty, SprocketData>;
