import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual } from "typeorm";

import { Sale } from "../../sales/entities";
import { SalesService } from "../../sales/sales.service";

@Injectable()
export class SalesTool {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    private salesService: SalesService,
  ) {}

  // ── Today's summary ──────────────────
  async getTodaySales(shopId: number) {
    const { start, end } = this.todayRange();
    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId }, createdAt: Between(start, end) },
      select: { id: true, totalAmount: true, createdAt: true },
    });
    return {
      total: sales.reduce((s, x) => s + Number(x.totalAmount), 0),
      count: sales.length,
    };
  }

  // ── Weekly / N-day trend ─────────────
  async getWeeklySales(shopId: number, days = 7) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (days - 1));

    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId }, createdAt: MoreThanOrEqual(from) },
      select: { id: true, totalAmount: true, createdAt: true },
    });

    const map = new Map<string, { total: number; count: number }>();
    for (const s of sales) {
      const key = s.createdAt.toISOString().split("T")[0];
      const e = map.get(key) ?? { total: 0, count: 0 };
      e.total += Number(s.totalAmount);
      e.count++;
      map.set(key, e);
    }

    return [...map.entries()]
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ── Top selling products ─────────────
  async getTopSelling(shopId: number, limit = 10) {
    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
      relations: { items: { product: true } },
      select: {
        id: true,
        items: {
          quantity: true,
          unitPrice: true,
          product: { id: true, name: true },
        },
      },
    });

    const map = new Map<number, { name: string; totalQty: number; totalRevenue: number }>();
    for (const sale of sales) {
      for (const item of sale.items ?? []) {
        const pid = item.product?.id;
        if (!pid) continue;
        const e = map.get(pid) ?? { name: item.product.name, totalQty: 0, totalRevenue: 0 };
        e.totalQty += Number(item.quantity);
        e.totalRevenue += Number(item.quantity) * Number(item.unitPrice);
        map.set(pid, e);
      }
    }

    return [...map.values()]
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, limit);
  }

  // ── Recent sales ─────────────────────
  async getRecentSales(shopId: number, limit = 10) {
    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
      relations: { items: { product: true }, customer: true },
      order: { createdAt: "DESC" },
      take: limit,
    });

    return sales.map((s) => ({
      date: s.createdAt,
      total: Number(s.totalAmount),
      customer: s.customer?.name ?? "Walk-in",
      items: s.items?.map((i) => `${i.product?.name} x${i.quantity}`) ?? [],
    }));
  }

  // ── Create sale ──────────────────────
  async createSale(data: any, shopId: number, userId: number) {
    return this.salesService.create(data, shopId, userId);
  }

  // ── Helper ───────────────────────────
  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
}