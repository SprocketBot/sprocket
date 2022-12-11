import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories/repository";
import {Webhook} from "./webhook.entity";

@Injectable()
export class WebhookRepository extends ExtendedRepository<Webhook> {
    constructor(readonly dataSource: DataSource) {
        super(Webhook, dataSource);
    }
}
