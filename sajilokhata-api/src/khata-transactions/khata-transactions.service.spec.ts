import { Test, TestingModule } from '@nestjs/testing';
import { KhataTransactionsService } from './khata-transactions.service';

describe('KhataTransactionsService', () => {
  let service: KhataTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KhataTransactionsService],
    }).compile();

    service = module.get<KhataTransactionsService>(KhataTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
