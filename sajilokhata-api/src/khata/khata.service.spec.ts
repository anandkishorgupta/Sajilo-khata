import { Test, TestingModule } from '@nestjs/testing';
import { KhataService } from './khata.service';

describe('KhataService', () => {
  let service: KhataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KhataService],
    }).compile();

    service = module.get<KhataService>(KhataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
