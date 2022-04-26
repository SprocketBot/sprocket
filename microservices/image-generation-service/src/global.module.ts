import {Global, Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";
import * as config from "config";
import {readFileSync} from "fs";
import {Client as MinioClient} from "minio";

const client = ClientsModule.register([
    {
        name: "Client",
        transport: Transport.RMQ,
        options: {
            urls: config.get("transport.url"),
            queue: config.has("transport.queue") ? config.get("transport.queue") : undefined,
        },
    },
]);


const minioClient = new MinioClient({
    endPoint: config.get("s3.endpoint"),
    port: config.get("s3.port"),
    useSSL: config.get("s3.ssl"),
    accessKey: config.get("s3.accessKey"),
    secretKey: readFileSync("./secret/s3-password.txt").toString(),
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
