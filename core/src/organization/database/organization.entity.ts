import {Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class Organization extends BaseEntity {}
