import { Module } from '@nestjs/common';
import { SaleItemsController } from './sale-items.controller';
import { SaleItemsService } from './sale-items.service';

@Module({
  controllers: [SaleItemsController],
  providers: [SaleItemsService]
})
export class SaleItemsModule {}
