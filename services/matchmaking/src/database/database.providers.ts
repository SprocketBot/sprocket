import { Scrim } from './entities/scrim.entity';
import { Participant } from './entities/participant.entity';

export const databaseProviders = [
  {
    provide: 'SCRIM_REPOSITORY',
    useValue: Scrim,
  },
  {
    provide: 'PARTICIPANT_REPOSITORY',
    useValue: Participant,
  },
];
