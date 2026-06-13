import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res
} from "@nestjs/common";

import type { Response } from "express";


import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { InvoicesService } from "./invoices.service";

@Controller("invoices")
// @UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) { }

  // =====================================
  // FULL PDF INVOICE
  // =====================================
  @Get(":saleId/pdf")
  generateInvoice(
    @Param("saleId", ParseIntPipe)
    saleId: number,

    @CurrentUser()
    user: any,

    @Res()
    res: Response,
  ) {
    return this.invoicesService.generateInvoice(
      saleId,
      user.shopId,
      res,
    );
  }

  // =====================================
  // THERMAL RECEIPT
  // =====================================
  @Get(":saleId/thermal")
  thermalReceipt(
    @Param("saleId", ParseIntPipe)
    saleId: number,

    @CurrentUser()
    user: any,

    @Res()
    res: Response,
  ) {
    return this.invoicesService.thermalReceipt(
      saleId,
      user.shopId,
      res,
    );
  }
}