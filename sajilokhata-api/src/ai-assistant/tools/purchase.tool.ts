import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual } from "typeorm";

import { Purchase } from "../../purchases/entities";
import { PurchasesService } from "../../purchases/purchases.service";

@Injectable()
export class PurchaseTool {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,
    private purchasesService: PurchasesService,
  ) {}

  // ── Today's purchases ────────────────
  async getTodayPurchase(shopId: number) {
    const { start, end } = this.todayRange();
    const purchases = await this.purchaseRepo.find({
      where: { shop: { id: shopId }, createdAt: Between(start, end) },
      select: { id: true, totalAmount: true },
    });
    return {
      total: purchases.reduce((s, p) => s + Number(p.totalAmount), 0),
      count: purchases.length,
    };
  }

  // ── Purchase summary for N days ──────
  async getPurchaseSummary(shopId: number, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    const purchases = await this.purchaseRepo.find({
      where: { shop: { id: shopId }, createdAt: MoreThanOrEqual(from) },
      select: { id: true, totalAmount: true, createdAt: true },
    });
    return {
      total: purchases.reduce((s, p) => s + Number(p.totalAmount), 0),
      count: purchases.length,
      days,
    };
  }

  // ── Create purchase ──────────────────
  async createPurchase(data: any, shopId: number, userId: number) {
    return this.purchasesService.create(data, shopId, userId);
  }

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
}