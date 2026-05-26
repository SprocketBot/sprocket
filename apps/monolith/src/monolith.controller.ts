import {Controller, Get} from "@nestjs/common";

@Controller("health")
export class MonolithController {
    @Get()
    healthCheck(): {status: string; timestamp: string; services: string[];} {
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
