import { Injectable, Logger } from '@nestjs/common';
import { generateText } from 'ai';

import { AiSdkService } from '../ai-assistant/llm/ai-sdk.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardInsightsService {
  private readonly logger = new Logger(DashboardInsightsService.name);

  constructor(
    private readonly aiSdk: AiSdkService,
    private readonly dashboard: DashboardService,
  ) {}

  async getInsights(shopId: number) {
    const [stats, weekly, topProducts, lowStock, expense] =
      await Promise.all([
        this.dashboard.getStats(shopId),
        this.dashboard.weeklySales(shopId),
        this.dashboard.topProducts(shopId),
        this.dashboard.lowStock(shopId),
        this.dashboard.expenseBreakdown(shopId),
      ]);

    const dataSummary = JSON.stringify(
      {
        totalSales: stats.totalSales,
        totalExpense: stats.totalExpense,
        netProfit: stats.netProfit,
        totalDue: stats.totalDue,
        lowStockCount: stats.lowStockCount,
        weeklySales: weekly,
        topProducts: topProducts.slice(0, 5).map((p) => ({
          name: p.product.name,
          quantity: p.quantity,
        })),
        lowStockItems: lowStock.slice(0, 5).map((p) => ({
          name: p.name,
          stock: p.stock,
        })),
        expenseBreakdown: expense.slice(0, 5),
      },
      null,
      2,
    );

    const result = await generateText({
      model: this.aiSdk.getModel(),
      system: `You are a business analyst for a small Nepali shop. Given the shop data below, write a 2-4 sentence daily insight. Be specific with numbers (use Rs for currency). Highlight: top-performing area, any low-stock warnings, expense patterns, and due amount risk. Reply in the same language the user typically uses (English or Nepali). Keep it concise and actionable.`,
      prompt: `Here is today's shop data:\n${dataSummary}`,
      temperature: 0.3,
    });

    return { insight: result.text };
  }
}
