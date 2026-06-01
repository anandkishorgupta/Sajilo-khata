import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { CurrentUser } from "../auth/decorators/current-user.decorator";

import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  // =====================================
  // MAIN STATS
  // =====================================
  @Get("stats")
  stats(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.getStats(
      user.shopId,
    );
  }

  // =====================================
  // SALES CHART
  // =====================================
  @Get("sales-chart")
  salesChart(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.salesChart(
      user.shopId,
    );
  }

  // =====================================
  // TOP PRODUCTS
  // =====================================
  @Get("top-products")
  topProducts(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.topProducts(
      user.shopId,
    );
  }

  // =====================================
  // LOW STOCK
  // =====================================
  @Get("low-stock")
  lowStock(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.lowStock(
      user.shopId,
    );
  }

  // =====================================
  // DUE ANALYTICS
  // =====================================
  @Get("due-analytics")
  dueAnalytics(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.dueAnalytics(
      user.shopId,
    );
  }
}