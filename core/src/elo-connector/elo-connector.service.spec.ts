import { Test, TestingModule } from '@nestjs/testing';
import { EloConnectorService } from './elo-connector.service';

describe('EloConnectorService', () => {
  let service: EloConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EloConnectorService],
    }).compile();

    service = module.get<EloConnectorService>(EloConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
