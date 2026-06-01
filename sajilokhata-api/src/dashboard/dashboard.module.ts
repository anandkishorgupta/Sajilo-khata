import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

import { Expense } from "../expenses/entities";
import { KhataTransaction } from "../khata-transactions/entities";
import { Product } from "../products/entities";
import { Purchase } from "../purchases/entities";
import { Sale } from "../sales/entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Purchase,
      Expense,
      Product,
      KhataTransaction,
    ]),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [DashboardService],
})
export class DashboardModule { }