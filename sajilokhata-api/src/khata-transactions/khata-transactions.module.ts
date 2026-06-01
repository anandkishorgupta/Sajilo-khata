import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { KhataTransaction } from "./entities";

import { Customer } from "../customers/entities";

import { Shop } from "../shops/entities";

import { KhataTransactionsController } from "./khata-transactions.controller";

import { KhataTransactionsService } from "./khata-transactions.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KhataTransaction,
      Customer,
      Shop,
    ]),
  ],

  controllers: [
    KhataTransactionsController,
  ],

  providers: [
    KhataTransactionsService,
  ],

  exports: [
    KhataTransactionsService,
  ],
})
export class KhataTransactionsModule {}