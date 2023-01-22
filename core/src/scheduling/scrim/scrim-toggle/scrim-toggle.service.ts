import {Injectable} from "@nestjs/common";
import {config, EventsService, EventTopic, RedisService} from "@sprocketbot/common";

@Injectable()
export class ScrimToggleService {
    private readonly key = `${config.redis.prefix}:scrims-disabled`;

    constructor(private readonly redisService: RedisService, private readonly eventsService: EventsService) {}

    async scrimsAreDisabled(): Promise<string | null> {
        const disabledReason = await this.redisService.get(this.key);

        return disabledReason;
    }

    async disableScrims(reason?: string): Promise<boolean> {
        await this.redisService.set(this.key, reason ?? "");
        await this.eventsService.publish(EventTopic.ScrimsDisabled, {
            disabled: true,
            reason: reason,
        });

        return true;
    }

    async enableScrims(): Promise<boolean> {
        await this.redisService.delete(this.key);
        await this.eventsService.publish(EventTopic.ScrimsDisabled, {disabled: false});

        return true;
    }
}
