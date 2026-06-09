import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { Expense } from "./entities";

import { Shop } from "../shops/entities/shop.entity";

import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Shop,
    ]),
  ],

  controllers: [
    ExpensesController,
  ],

  providers: [ExpensesService],
  exports: [ExpensesService],

})
export class ExpensesModule {}