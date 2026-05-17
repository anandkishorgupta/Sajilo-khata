import { Module } from '@nestjs/common';
import { PurchaseItemsController } from './purchase-items.controller';
import { PurchaseItemsService } from './purchase-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseItem } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseItem])],
  controllers: [PurchaseItemsController],
  providers: [PurchaseItemsService]
})
export class PurchaseItemsModule {}
