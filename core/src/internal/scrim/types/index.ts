import {registerEnumType} from "@nestjs/graphql";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";

export * from "./CreateScrimInput";
export * from "./JoinScrimInput";
export * from "./Scrim";
export * from "./ScrimGame";
export * from "./ScrimLobby";
export * from "./ScrimMetrics";
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
