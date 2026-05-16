import { Test, TestingModule } from '@nestjs/testing';
import { KhataTransactionsController } from './khata-transactions.controller';

describe('KhataTransactionsController', () => {
  let controller: KhataTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KhataTransactionsController],
    }).compile();

    controller = module.get<KhataTransactionsController>(KhataTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
