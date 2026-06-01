import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Sale } from "../sales/entities";
import { Purchase } from "../purchases/entities";
import { Expense } from "../expenses/entities";
import { Product } from "../products/entities";
import { KhataTransaction } from "../khata-transactions/entities";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,

    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(KhataTransaction)
    private khataRepo: Repository<KhataTransaction>,
  ) {}

  // =====================================
  // MAIN DASHBOARD STATS
  // =====================================
  async getStats(shopId: number) {
    const sales = await this.saleRepo.find({
      where: {
        shop: {
          id: shopId,
        },
      },
    });

    const purchases =
      await this.purchaseRepo.find({
        where: {
          shop: {
            id: shopId,
          },
        },
      });

    const expenses =
      await this.expenseRepo.find({
        where: {
          shop: {
            id: shopId,
          },
        },
      });

    const products =
      await this.productRepo.find({
        where: {
          shop: {
            id: shopId,
          },
        },
      });

    // =========================
    // TOTALS
    // =========================

    const totalSales = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.totalAmount),
      0,
    );

    const totalPurchase =
      purchases.reduce(
        (sum, purchase) =>
          sum +
          Number(purchase.totalAmount),
        0,
      );

    const totalExpense =
      expenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount),
        0,
      );

    // =========================
    // PROFIT
    // =========================

    const grossProfit = sales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce(
          (itemSum, item) =>
            itemSum +
            Number(item.profit),
          0,
        ),
      0,
    );

    const netProfit =
      grossProfit - totalExpense;

    // =========================
    // LOW STOCK
    // =========================

    const lowStockProducts =
      products.filter(
        (product) =>
          product.stock <=
          product.lowStockLimit,
      );

    // =========================
    // DUE AMOUNT
    // =========================

    const totalDue = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.dueAmount),
      0,
    );

    return {
      totalSales,
      totalPurchase,
      totalExpense,

      grossProfit,
      netProfit,

      totalDue,

      totalProducts: products.length,

      lowStockCount:
        lowStockProducts.length,
    };
  }

  // =====================================
  // SALES CHART
  // =====================================
  async salesChart(shopId: number) {
    const sales = await this.saleRepo.find({
      where: {
        shop: {
          id: shopId,
        },
      },

      order: {
        createdAt: "ASC",
      },
    });

    const grouped: Record<
      string,
      number
    > = {};

    for (const sale of sales) {
      const date =
        sale.createdAt
          .toISOString()
          .split("T")[0];

      grouped[date] =
        (grouped[date] || 0) +
        Number(sale.totalAmount);
    }

    return Object.entries(grouped).map(
      ([date, amount]) => ({
        date,
        amount,
      }),
    );
  }

  // =====================================
  // TOP PRODUCTS
  // =====================================
  async topProducts(shopId: number) {
    const sales = await this.saleRepo.find({
      where: {
        shop: {
          id: shopId,
        },
      },

      relations: {
        items: {
          product: true,
        },
      },
    });

    const map = new Map();

    for (const sale of sales) {
      for (const item of sale.items) {
        const productId =
          item.product.id;

        if (!map.has(productId)) {
          map.set(productId, {
            product: item.product,
            quantity: 0,
          });
        }

        map.get(productId).quantity +=
          item.quantity;
      }
    }

    return [...map.values()]
      .sort(
        (a, b) =>
          b.quantity - a.quantity,
      )
      .slice(0, 10);
  }

  // =====================================
  // LOW STOCK PRODUCTS
  // =====================================
  async lowStock(shopId: number) {
    return this.productRepo.find({
      where: {
        shop: {
          id: shopId,
        },
      },
    }).then((products) =>
      products.filter(
        (p) =>
          p.stock <= p.lowStockLimit,
      ),
    );
  }

  // =====================================
  // DUE ANALYTICS
  // =====================================
  async dueAnalytics(shopId: number) {
    const credits =
      await this.khataRepo.find({
        where: {
          shop: {
            id: shopId,
          },
        },

        relations: {
          customer: true,
        },
      });

    let totalCredit = 0;
    let totalPayment = 0;

    for (const tx of credits) {
      if (tx.type === "credit") {
        totalCredit += Number(
          tx.amount,
        );
      }

      if (tx.type === "payment") {
        totalPayment += Number(
          tx.amount,
        );
      }
    }

    return {
      totalCredit,
      totalPayment,

      remainingDue:
        totalCredit - totalPayment,
    };
  }
}