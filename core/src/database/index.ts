import type {ModelLifecycleFields} from "./base-model";

export * from "./configuration";
export * from "./database.module";
export * from "./franchise";
export * from "./identity";
export * from "./image-gen";
export * from "./scheduling";

export type TypeOrmFields = "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
