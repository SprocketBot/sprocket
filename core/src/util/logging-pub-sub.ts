import {Logger} from "@nestjs/common";
import {PubSub} from "apollo-server-express";

/**
 * PubSub wrapper that logs WebSocket events
 */
export class LoggingPubSub extends PubSub {
    private readonly logger: Logger;

    private subSeq = 0;

    private activeSubs = 0;

    constructor(private readonly channel: string) {
        super();
        this.logger = new Logger(`WSS:${channel}`);
    }

    async publish(triggerName: string, payload: unknown): Promise<void> {
        this.logger.log(`publish channel=${this.channel} topic=${triggerName} activeSubs=${this.activeSubs}`);
        return super.publish(triggerName, payload);
    }

    asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
        const id = ++this.subSeq;
        this.activeSubs += 1;
        const topic = Array.isArray(triggers) ? triggers.join(",") : triggers;
        this.logger.log(`subscribe #${id} channel=${this.channel} topic=${topic} activeSubs=${this.activeSubs}`);

        const iterator = super.asyncIterator<T>(triggers);
        const originalReturn = iterator.return?.bind(iterator);
        iterator.return = async (value?: unknown): Promise<IteratorResult<T>> => {
            this.activeSubs -= 1;
            this.logger.log(`unsubscribe #${id} channel=${this.channel} topic=${topic} activeSubs=${this.activeSubs}`);
            if (originalReturn) return originalReturn(value);
            return {value: value as T, done: true};
        };
        return iterator;
    }
}
