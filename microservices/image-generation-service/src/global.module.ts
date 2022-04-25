import {Global, Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import * as config from "config";

const client = ClientsModule.register([
    {
        name: "Client",
        transport: Transport.NATS,
        options: {
            url: config.get("transport.url"),
            queue: config.has("transport.queue") ? config.get("transport.queue") : undefined,
        },
    },
]);

@Global()
@Module({
    imports: [client],
    exports: [client],
})
export class GlobalModule { }
