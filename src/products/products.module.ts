import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities';
import { Product } from './entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImagekitModule } from '../imagekit/imagekit.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [MulterModule.register({
    storage: memoryStorage(),
  }), ImagekitModule, TypeOrmModule.forFeature([Product, Shop])],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule { }
