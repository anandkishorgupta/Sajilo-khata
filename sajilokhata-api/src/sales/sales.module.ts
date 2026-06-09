import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

import { Sale, SaleItem } from './entities';
import { Product } from '../products/entities';
import { Customer } from '../customers/entities';
import { Shop } from '../shops/entities';
import { StockMovement } from '../stock-movements/entities';
import { KhataTransaction } from '../khata-transactions/entities';
import { PurchaseItem } from '../purchases/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Product,
      Customer,
      Shop,
      SaleItem,
      StockMovement,
      KhataTransaction,
      PurchaseItem
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],

})
export class SalesModule {}