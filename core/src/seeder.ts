import {seeder} from "nestjs-seeder";

import {DatabaseModule} from "./database";
import * as seeds from "./seeds";
seeder({
    imports: [
        DatabaseModule,
    ],
}).run(Object.values(seeds).flat(4));
