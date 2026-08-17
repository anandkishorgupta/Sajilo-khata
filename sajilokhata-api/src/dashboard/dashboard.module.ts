import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { DashboardInsightsService } from "./dashboard-insights.service";
import { AiAssistantModule } from "../ai-assistant/ai-assistant.module";

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
    AiAssistantModule,
  ],

  controllers: [
    DashboardController,
  ],

  providers: [DashboardService, DashboardInsightsService],
})
export class DashboardModule { }