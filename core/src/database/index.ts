import type {ModelLifecycleFields} from "./base-model";

export * from "./authorization";
export * from "./configuration";
export * from "./database.module";
export * from "./draft";
export * from "./franchise";
export * from "./game";
export * from "./identity";
export * from "./image-gen";
export * from "./organization";
export * from "./scheduling";

export type TypeOrmFields =
    | "hasId"
    | "save"
    | "remove"
    | "softRemove"
    | "recover"
    | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
