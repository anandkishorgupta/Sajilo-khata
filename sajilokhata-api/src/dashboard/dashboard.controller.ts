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

  // =====================================
  // RECENT TRANSACTIONS
  // =====================================
  @Get("recent-transactions")
  recentTransactions(@CurrentUser() user: any) {
    return this.dashboardService.recentTransactions(user.shopId);
  }

  // =====================================
  // PAYMENT METHODS
  // =====================================
  @Get("payment-methods")
  paymentMethods(@CurrentUser() user: any) {
    return this.dashboardService.paymentMethods(user.shopId);
  }

  // =====================================
  // WEEKLY SALES
  // =====================================
  @Get("weekly-sales")
  weeklySales(@CurrentUser() user: any) {
    return this.dashboardService.weeklySales(user.shopId);
  }

  // =====================================
  // EXPENSE BREAKDOWN
  // =====================================
  @Get("expense-breakdown")
  expenseBreakdown(@CurrentUser() user: any) {
    return this.dashboardService.expenseBreakdown(user.shopId);
  }

  // =====================================
  // INVENTORY STATUS
  // =====================================
  @Get("inventory-status")
  inventoryStatus(@CurrentUser() user: any) {
    return this.dashboardService.inventoryStatus(user.shopId);
  }
}