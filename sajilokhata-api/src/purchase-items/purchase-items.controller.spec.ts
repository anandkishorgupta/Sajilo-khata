import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseItemsController } from './purchase-items.controller';

describe('PurchaseItemsController', () => {
  let controller: PurchaseItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseItemsController],
    }).compile();

    controller = module.get<PurchaseItemsController>(PurchaseItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
