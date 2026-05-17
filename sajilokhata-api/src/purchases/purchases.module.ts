import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities';
import { PurchaseItem } from '../purchase-items/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase,PurchaseItem])], // Add your entities here
  providers: [PurchasesService],
  controllers: [PurchasesController]
})
export class PurchasesModule {}
