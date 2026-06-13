import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { GetStockMovementsDto } from "./dto";
import { StockMovementsService } from "./stock-movements.service";

@Controller("stock-movements")
// @UseGuards(JwtAuthGuard)
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) { }

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