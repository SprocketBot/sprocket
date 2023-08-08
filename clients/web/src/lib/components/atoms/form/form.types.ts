/** Indicates whether a form control contains a value that is valid, invalid, or not yet validated (or contains no data) */
export type FormControlState = "valid" | "invalid" | "none";

/** Configure the size (height) of a form control */
export type FormControlSize = "sm" | "md" | "lg";


export type RemovableFile = File & {
    /** Removes this file from the list of files */
    remove: () => void;
};