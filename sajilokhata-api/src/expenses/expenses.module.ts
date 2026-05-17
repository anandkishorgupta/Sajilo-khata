import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])], // Add any necessary imports here
  providers: [ExpensesService],
  controllers: [ExpensesController]
})
export class ExpensesModule {}
