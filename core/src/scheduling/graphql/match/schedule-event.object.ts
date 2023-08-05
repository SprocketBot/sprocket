import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ScheduledEventObject {
    @Field(() => String)
    description: string;

    @Field(() => Date)
    start: Date;

    @Field(() => Date)
    end?: Date;

    @Field(() => String)
    url?: string;

    // @ManyToOne(() => Member, {nullable: true})
    // host?: Member;

    // @ManyToOne(() => GameMode, {nullable: true})
    // gameMode?: GameMode;

    // @ManyToOne(() => Game, {nullable: true})
    // game?: Game;

    // @OneToMany(() => MatchParent, mp => mp.event, {nullable: true})
    // matchParents?: MatchParent;
}
