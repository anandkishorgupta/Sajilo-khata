import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities';
import { Shop } from '../shops/entities';
import { StockMovement } from '../stock-movements/entities';
import { ProductsModule } from './../products/products.module';
import { Purchase, PurchaseItem } from './entities';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [ProductsModule, TypeOrmModule.forFeature([Purchase, PurchaseItem, Product, Shop, StockMovement])], // Add your entities here
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService],

})
export class PurchasesModule { }
