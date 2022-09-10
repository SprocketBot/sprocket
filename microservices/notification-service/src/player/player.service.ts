import {Injectable} from "@nestjs/common";
import {
    BotService,
    CoreService,
    EventsService,
    EventTopic,
    PlayerSkillGroupChanged,
    SprocketEvent,
    SprocketEventMarshal,
} from "@sprocketbot/common";

@Injectable()
export class PlayerService extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        private readonly botService: BotService,
        private readonly coreService: CoreService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.PlayerSkillGroupChanged)
    async sendSkillGroupChanged(sgChangedPayload: PlayerSkillGroupChanged): Promise<void> {
        console.log(sgChangedPayload.player.id);

    }
}
