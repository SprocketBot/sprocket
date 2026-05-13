import {Module} from "@nestjs/common";
import {ClientsModule} from "@nestjs/microservices";

import {CommonClient} from "../../global.types";
import {PostgresClientProxy} from "../../postgres-transport";
import {config} from "../../util";
import {CoreService} from "./core.service";

@Module({
    providers: [CoreService],
    exports: [CoreService],
    imports: [
        ClientsModule.register([
            {
                name: CommonClient.Core,
                customClass: PostgresClientProxy,
                options: {
                    queue: config.transport.core_queue,
                },
            },
        ]),
    ],
})
export class CoreModule {}
