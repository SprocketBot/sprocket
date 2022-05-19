import {Injectable, Logger} from "@nestjs/common";
import type {Scrim} from "@sprocketbot/common";

@Injectable()
export class ScrimValidationService {
    private readonly logger = new Logger(ScrimValidationService.name);

    async validate(scrim: Scrim, submissionId: string): Promise<boolean> {
        this.logger.debug(`Validating scrim: scrimId=${scrim.id} submissionId=${submissionId}`);
        return true;
    }
}
