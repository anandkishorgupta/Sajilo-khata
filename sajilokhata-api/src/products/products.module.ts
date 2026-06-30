import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { CategoriesModule } from '../categories/categories.module';
import { ImagekitModule } from '../imagekit/imagekit.module';
import { PurchaseItem } from '../purchases/entities';
import { SaleItem } from '../sales/entities';
import { Shop } from '../shops/entities';
import { Product } from './entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [MulterModule.register({
    storage: memoryStorage(),
  }), ImagekitModule, CategoriesModule, TypeOrmModule.forFeature([Product, Shop, PurchaseItem, SaleItem])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductsModule { }
