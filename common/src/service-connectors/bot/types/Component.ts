import {z} from "zod";

export enum ComponentType {
    ACTION_ROW = 1,
    BUTTON = 2,
    SELECT_MENU = 3,
    TEXT_INPUT = 4,
}

export enum ButtonComponentStyle {
    PRIMARY = 1,
    SECONDARY = 2,
    SUCCESS = 3,
    DANGER = 4,
    LINK = 5,
}

export const BaseComponentSchema = z.object({
    type: z.nativeEnum(ComponentType),
});

export const ButtonComponentSchema = BaseComponentSchema.extend({
    type: z.literal(ComponentType.BUTTON),
    style: z.nativeEnum(ButtonComponentStyle),
    label: z.string().optional(),
    emoji: z.object({}).optional(),
    url: z.string().optional(),
    disabled: z.boolean().optional(),
});

export const ActionRowComponentSchema = BaseComponentSchema.extend({
    type: z.literal(ComponentType.ACTION_ROW),
    components: z.array(ButtonComponentSchema),
});

export type Component = z.infer<typeof ActionRowComponentSchema>;
