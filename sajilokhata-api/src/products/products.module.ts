import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { Shop } from '../shops/entities';
import { Product } from './entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImagekitModule } from '../imagekit/imagekit.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PurchaseItem } from '../purchases/entities';
import { SaleItem } from '../sales/entities';

@Module({
  imports: [MulterModule.register({
    storage: memoryStorage(),
  }), ImagekitModule, CategoriesModule, TypeOrmModule.forFeature([Product, Shop,PurchaseItem,SaleItem])],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule { }
