import { Test, TestingModule } from '@nestjs/testing';
import { EloConnectorController } from './elo-connector.controller';

describe('EloConnectorController', () => {
  let controller: EloConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EloConnectorController],
    }).compile();

    controller = module.get<EloConnectorController>(EloConnectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
