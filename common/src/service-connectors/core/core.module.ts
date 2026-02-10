import {Module} from "@nestjs/common";

import {GlobalModule} from "../../global.module";
import {CoreService} from "./core.service";

@Module({
    providers: [CoreService],
    exports: [CoreService],
    imports: [GlobalModule],
})
export class CoreModule {}
