import {Controller, Get} from "@nestjs/common";

@Controller("healthz")
export class HealthController {
    @Get()
    check(): {status: string} {
        return {status: "ok"};
    }
}
