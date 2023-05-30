export type SelectOptionValue = string | number;
export type SelectOption<T extends SelectOptionValue> = {label: string; value: T};
export type SelectOptions<T extends SelectOptionValue> = SelectOption<T>[];
