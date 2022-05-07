import { Test, TestingModule } from '@nestjs/testing';
import { MledbUserService } from './mledb-user.service';

describe('MledbUserService', () => {
  let service: MledbUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MledbUserService],
    }).compile();

    service = module.get<MledbUserService>(MledbUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
