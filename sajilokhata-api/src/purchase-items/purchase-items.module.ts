import { Module } from '@nestjs/common';
import { PurchaseItemsController } from './purchase-items.controller';
import { PurchaseItemsService } from './purchase-items.service';

@Module({
  controllers: [PurchaseItemsController],
  providers: [PurchaseItemsService]
})
export class PurchaseItemsModule {}
