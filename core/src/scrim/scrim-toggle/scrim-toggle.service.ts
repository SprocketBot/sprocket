import {Inject, Injectable, Logger} from "@nestjs/common";
import {
    config,
    EventsService,
    EventTopic,
    RedisService,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ScrimPubSub} from "../constants";

@Injectable()
export class ScrimToggleService {
    private logger = new Logger(ScrimToggleService.name);

    private readonly key = `${config.redis.prefix}:scrims-disabled`;

    private subscribed = false;

    constructor(
        private readonly redisService: RedisService,
        private readonly eventsService: EventsService,
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
    ) {}

    get scrimsDisabledSubTopic(): string {
        return "scrims.disabled";
    }

    async scrimsAreDisabled(): Promise<boolean> {
        return (await this.redisService.get(this.key)) === "true";
    }

    async disableScrims(): Promise<boolean> {
        await this.redisService.set(this.key, "true");
        await this.eventsService.publish(EventTopic.ScrimsDisabled, true);
        return true;
    }

    async enableScrims(): Promise<boolean> {
        await this.redisService.delete(this.key);
        await this.eventsService.publish(EventTopic.ScrimsDisabled, false);
        return true;
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;

        await this.eventsService
            .subscribe(EventTopic.ScrimsDisabled, true)
            .then(rx => {
                rx.subscribe(v => {
                    this.pubSub
                        .publish(this.scrimsDisabledSubTopic, {
                            followScrimsDisabled: v.payload,
                        })
                        .catch(this.logger.error.bind(this.logger));
                });
            });
    }
}
