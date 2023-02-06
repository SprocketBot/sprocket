import {Module} from "@nestjs/common";

import {S3Service} from "./s3.service";

@Module({
    providers: [S3Service],
    exports: [S3Service],
})
export class S3Module {
    constructor(private readonly s3Service: S3Service) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.s3Service.checkBuckets();
    }
}
