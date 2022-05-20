import {Global, Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
// Import * as config from "config";
import {config} from "@sprocketbot/common/lib/util/config";
import {Client as MinioClient} from "minio";

const client = ClientsModule.register([
    {
        name: "Client",
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.image_generation_queue,
        },
    },
]);


const minioClient = new MinioClient({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});
const minioProvider = {
    provide: "s3",
    useValue: minioClient,
};

@Global()
@Module({
    imports: [client],
    providers: [minioProvider],
    exports: [client, minioProvider],
})
export class GlobalModule { }
