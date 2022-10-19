import type {ModelLifecycleFields} from "./base-model";

export * from "./base-model";
export * from "./database.module";
export * from "./identity";
export * from "./scheduling";

export type TypeOrmFields = "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
