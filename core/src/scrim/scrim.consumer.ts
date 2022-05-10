import {Process, Processor} from "@nestjs/bull";
import {Job} from "bull";

@Processor("scrim")
export class ScrimConsumer {
    @Process("timeoutQueue")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async timeoutQueue(job: Job<unknown>): Promise<void> {
        // do things
    }
}
