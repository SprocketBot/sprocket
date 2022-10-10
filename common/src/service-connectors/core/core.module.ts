import {Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";

import {CommonClient} from "../../global.types";
import {config} from "../../util";
import {UtilModule} from "../../util/util.module";
import {CoreService} from "./core.service";

@Module({
    providers: [CoreService],
    exports: [CoreService],
    imports: [
        UtilModule,
        ClientsModule.register([
            {
                name: CommonClient.Core,
                transport: Transport.RMQ,
                options: {
                    urls: [config.transport.url] as string[],
                    queue: config.transport.core_queue,
                    queueOptions: {
                        durable: true,
                    },
                    socketOptions: {
                        heartbeat: 120,
                    },
                },
            },
        ]),
    ],
})
export class CoreModule {}
