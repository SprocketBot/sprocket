import type { ModelLifecycleFields } from "./base-model";

export * from "./authorization";
export * from "./configuration";
export * from "./database.module";
export * from "./draft";
// export * from "./franchise"; // Removed to avoid circular dependencies
// export * from "./game"; // Removed to avoid circular dependencies
export * from "./identity";
export * from "./image-gen";
// export * from "./organization"; // Removed to avoid circular dependencies
// export * from "./scheduling"; // Removed to avoid circular dependencies

export type TypeOrmFields = "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
