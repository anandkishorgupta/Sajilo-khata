import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { KhataTransactionsService } from "./khata-transactions.service";

import { CreatePaymentDto } from "./dto";

@Controller("khata")
@UseGuards(JwtAuthGuard)
export class KhataTransactionsController {
  constructor(
    private readonly khataService: KhataTransactionsService,
  ) {}

  // =====================================
  // CREATE PAYMENT
  // =====================================
  @Post("pay")
  createPayment(
    @Body()
    dto: CreatePaymentDto,

    @CurrentUser()
    user: any,
  ) {
    return this.khataService.createPayment(
      dto,
      user.shopId,
    );
  }

  // =====================================
  // CUSTOMER LEDGER
  // =====================================
  @Get("customer/:id")
  customerLedger(
    @Param("id", ParseIntPipe)
    customerId: number,

    @CurrentUser()
    user: any,
  ) {
    return this.khataService.getCustomerLedger(
      customerId,
      user.shopId,
    );
  }

  // =====================================
  // CUSTOMER BALANCE
  // =====================================
  @Get("customer/:id/balance")
  customerBalance(
    @Param("id", ParseIntPipe)
    customerId: number,

    @CurrentUser()
    user: any,
  ) {
    return this.khataService.getCustomerBalance(
      customerId,
      user.shopId,
    );
  }

  // =====================================
  // ALL DUE CUSTOMERS
  // =====================================
  @Get()
  findAll(
    @CurrentUser()
    user: any,
  ) {
    return this.khataService.findAll(
      user.shopId,
    );
  }
}