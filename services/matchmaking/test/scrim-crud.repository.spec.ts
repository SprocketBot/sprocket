import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Scrim } from '../src/entities/scrim.entity';
import { ScrimPlayer } from '../src/entities/scrim-player.entity';
import { ScrimTimeout } from '../src/entities/scrim-timeout.entity';
import { ScrimCrudService } from '../src/scrim-crud/scrim-crud.service';
import { Repository } from 'typeorm';

describe('ScrimCrudService', () => {
  let service: ScrimCrudService;
  let scrimRepo: Repository<Scrim>;
  let scrimPlayerRepo: Repository<ScrimPlayer>;
  let scrimTimeoutRepo: Repository<ScrimTimeout>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrimCrudService,
        {
          provide: getRepositoryToken(Scrim),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ScrimPlayer),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ScrimTimeout),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ScrimCrudService>(ScrimCrudService);
    scrimRepo = module.get<Repository<Scrim>>(getRepositoryToken(Scrim));
    scrimPlayerRepo = module.get<Repository<ScrimPlayer>>(getRepositoryToken(ScrimPlayer));
    scrimTimeoutRepo = module.get<Repository<ScrimTimeout>>(getRepositoryToken(ScrimTimeout));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(scrimRepo).toBeDefined();
    expect(scrimPlayerRepo).toBeDefined();
    expect(scrimTimeoutRepo).toBeDefined();
  });

  // Add more tests for CRUD operations as needed
});
