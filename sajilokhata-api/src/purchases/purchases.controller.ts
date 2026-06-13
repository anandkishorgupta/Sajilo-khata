import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreatePurchaseDto } from "./dto";
import { PurchasesService } from "./purchases.service";

@Controller("purchases")
// @UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) { }

  @Post()
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.purchasesService.create(dto, user.shopId, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.purchasesService.findAll(user.shopId);
  }

  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.purchasesService.findOne(id, user.shopId);
  }

  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.purchasesService.remove(id, user.shopId);
  }
}