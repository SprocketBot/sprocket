import {Controller, Get} from "@nestjs/common";

@Controller("health")
export class MonolithController {
    @Get()
    healthCheck() {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            services: [
                "core",
                "discord-bot",
                "matchmaking",
                "notification",
                "submission",
                "image-generation",
                "server-analytics",
            ],
        };
    }
}
