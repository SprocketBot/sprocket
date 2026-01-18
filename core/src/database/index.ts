import type {ModelLifecycleFields} from "./base-model";

// export * from "./authorization"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./configuration"; // Commented to avoid circular dependencies - use $db imports instead
export * from "./database.module";
// export * from "./draft"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./franchise"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./game"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./identity"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./image-gen"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./organization"; // Commented to avoid circular dependencies - use $db imports instead
// export * from "./scheduling"; // Commented to avoid circular dependencies - use $db imports instead

export type TypeOrmFields = "hasId" | "save" | "remove" | "softRemove" | "recover" | "reload";
export type IrrelevantFields = TypeOrmFields | ModelLifecycleFields;
