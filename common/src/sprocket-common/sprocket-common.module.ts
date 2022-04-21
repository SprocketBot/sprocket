import {Module} from "@nestjs/common";

import {CachingModule} from "./caching";
import {CeleryModule} from "./celery/celery.module";
import {EventsModule} from "./events";
import {MinioModule} from "./minio/minio.module";
import {RedisModule} from "./redis/redis.module";

@Module({
    imports: [CachingModule, EventsModule, CeleryModule, MinioModule, RedisModule],
})
export class SprocketCommonModule {}
