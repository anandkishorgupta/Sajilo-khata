import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { Sale } from "../sales/entities";

import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
    ]),
  ],

  controllers: [
    InvoicesController,
  ],

  providers: [InvoicesService],
})
export class InvoicesModule {}