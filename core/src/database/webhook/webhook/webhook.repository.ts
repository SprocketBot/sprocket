import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {Webhook} from "./webhook.model";

@Injectable()
export class WebhookRepository extends ExtendedRepository<Webhook> {
    constructor(readonly dataSource: DataSource) {
        super(Webhook, dataSource);
    }
}
