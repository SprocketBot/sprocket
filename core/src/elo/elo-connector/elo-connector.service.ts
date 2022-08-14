import {InjectQueue} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import {Queue} from "bull";

@Injectable()
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(@InjectQueue("elo") private eloQueue: Queue) {}
}
