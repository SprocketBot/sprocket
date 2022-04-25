import {registerEnumType} from "@nestjs/graphql";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";

export * from "./CreateScrimInput";
export * from "./Scrim";
export * from "./ScrimPlayer";
export * from "./ScrimSettings";
export * from "./ScrimTeam";

// Register Enums needed here
registerEnumType(ScrimStatus, {
    name: "ScrimStatus",
});
registerEnumType(ScrimMode, {
    name: "ScrimMode",
});
