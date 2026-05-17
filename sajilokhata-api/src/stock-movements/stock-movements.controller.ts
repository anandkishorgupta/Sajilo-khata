import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { StockMovementsService } from "./stock-movements.service";
import { GetStockMovementsDto } from "./dto";

@Controller("stock-movements")
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  // =========================
  // GET REPORT ONLY
  // =========================
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query() query: GetStockMovementsDto,
  ) {
    return this.service.findAll(user.shopId, query);
  }
}