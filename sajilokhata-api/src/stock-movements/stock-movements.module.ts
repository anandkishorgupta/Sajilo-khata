import { Module } from '@nestjs/common';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement])],

  controllers: [StockMovementsController],
  providers: [StockMovementsService]
})
export class StockMovementsModule {}
