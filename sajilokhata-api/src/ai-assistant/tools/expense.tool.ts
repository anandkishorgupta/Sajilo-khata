import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual } from "typeorm";

import { Expense } from "../../expenses/entities";
import { ExpensesService } from "../../expenses/expenses.service";

@Injectable()
export class ExpenseTool {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
    private expensesService: ExpensesService,
  ) {}

  // ── Today's expenses ─────────────────
  async getTodayExpense(shopId: number) {
    const { start, end } = this.todayRange();
    const expenses = await this.expenseRepo.find({
      where: { shop: { id: shopId }, createdAt: Between(start, end) },
      select: { id: true, amount: true },
    });
    return {
      total: expenses.reduce((s, e) => s + Number(e.amount), 0),
      count: expenses.length,
    };
  }

  // ── Breakdown by category ────────────
  async getExpenseBreakdown(shopId: number, days?: number) {
    const where: any = { shop: { id: shopId } };
    if (days) {
      const from = new Date();
      from.setDate(from.getDate() - days);
      where.createdAt = MoreThanOrEqual(from);
    }

    const expenses = await this.expenseRepo.find({
      where,
      select: { id: true, amount: true, category: true },
    });

    const map = new Map<string, number>();
    for (const e of expenses) {
      const cat = (e as any).category ?? "Other";
      map.set(cat, (map.get(cat) ?? 0) + Number(e.amount));
    }

    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  // ── Monthly total ────────────────────
  async getMonthlyExpense(shopId: number) {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await this.expenseRepo.find({
      where: { shop: { id: shopId }, createdAt: MoreThanOrEqual(from) },
      select: { id: true, amount: true },
    });
    return {
      total: expenses.reduce((s, e) => s + Number(e.amount), 0),
      month: from.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  }

  // ── Create expense ───────────────────
  async createExpense(data: any, shopId: number) {
    return this.expensesService.create(data, shopId);
  }

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
}