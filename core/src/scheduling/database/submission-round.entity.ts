import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class SubmissionRound extends BaseEntity {
    @Column()
    submissionId: string;

    @Column({type: "jsonb"})
    data: unknown;
}
