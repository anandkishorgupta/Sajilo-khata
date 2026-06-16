import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";

import { Sale } from "../sales/entities";
import { Purchase } from "../purchases/entities";
import { Expense } from "../expenses/entities";
import { Product } from "../products/entities";
import { KhataTransaction } from "../khata-transactions/entities";
import { Customer } from "../customers/entities";
import { AiConversation } from "./entities";

import { SalesModule } from "../sales/sales.module";
import { PurchasesModule } from "../purchases/purchases.module";
import { ExpensesModule } from "../expenses/expenses.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Purchase,
      Expense,
      Product,
      KhataTransaction,
      Customer,
      AiConversation,
    ]),
    SalesModule,
    PurchasesModule,
    ExpensesModule,
  ],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
})
export class AiAssistantModule {}
