import {Injectable} from "@nestjs/common";
import {config, RedisService} from "@sprocketbot/common";

@Injectable()
export class ScrimToggleService {
    private readonly key = `${config.redis.prefix}:scrims-disabled`;

    constructor(private readonly redisService: RedisService) {}

    async scrimsAreDisabled(): Promise<boolean> {
        return await this.redisService.get(this.key) === "true";
    }

    async disableScrims(): Promise<boolean> {
        await this.redisService.set(this.key, "true");
        return true;
    }

    async enableScrims(): Promise<boolean> {
        await this.redisService.delete(this.key);
        return true;
    }
}
