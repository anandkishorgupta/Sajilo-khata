import { Test, TestingModule } from '@nestjs/testing';
import { SaleItemsController } from './sale-items.controller';

describe('SaleItemsController', () => {
  let controller: SaleItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleItemsController],
    }).compile();

    controller = module.get<SaleItemsController>(SaleItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
