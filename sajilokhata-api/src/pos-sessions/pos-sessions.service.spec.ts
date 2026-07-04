import { Test, TestingModule } from '@nestjs/testing';
import { PosSessionsService } from './pos-sessions.service';

describe('PosSessionsService', () => {
  let service: PosSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosSessionsService],
    }).compile();

    service = module.get<PosSessionsService>(PosSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
