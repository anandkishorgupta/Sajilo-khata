import { Module } from '@nestjs/common';
import { SaleItemsController } from './sale-items.controller';
import { SaleItemsService } from './sale-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleItem } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([SaleItem])], // Add any necessary imports here
  controllers: [SaleItemsController],
  providers: [SaleItemsService]
})
export class SaleItemsModule {}
