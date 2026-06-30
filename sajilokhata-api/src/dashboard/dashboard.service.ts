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
      relations: {
        items: true,
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
  // TOP PRODUCTS (top 10 best selling products)
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

  // =====================================
  // RECENT TRANSACTIONS
  // =====================================
  async recentTransactions(shopId: number) {
    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return sales.map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      customer: s.customer?.name ?? 'Walk-in',
      amount: Number(s.totalAmount),
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
      createdAt: s.createdAt,
    }));
  }

  // =====================================
  // PAYMENT METHOD SPLIT
  // =====================================
  async paymentMethods(shopId: number) {
    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
    });

    const totals: Record<string, number> = {};
    for (const sale of sales) {
      const method = sale.paymentMethod;
      totals[method] = (totals[method] || 0) + Number(sale.totalAmount);
    }

    const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

    return Object.entries(totals).map(([method, amount]) => ({
      method,
      amount,
      percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }));
  }

  // =====================================
  // WEEKLY SALES
  // =====================================
  async weeklySales(shopId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sales = await this.saleRepo.find({
      where: { shop: { id: shopId } },
      order: { createdAt: 'ASC' },
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped: Record<string, number> = {};

    for (const sale of sales) {
      const d = new Date(sale.createdAt);
      if (d >= weekAgo) {
        const label = days[d.getDay()];
        grouped[label] = (grouped[label] || 0) + Number(sale.totalAmount);
      }
    }

    return days.map((d) => ({ day: d, amount: grouped[d] || 0 }));
  }

  // =====================================
  // EXPENSE BREAKDOWN BY CATEGORY
  // =====================================
  async expenseBreakdown(shopId: number) {
    const expenses = await this.expenseRepo.find({
      where: { shop: { id: shopId } },
    });

    const grouped: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      grouped[cat] = (grouped[cat] || 0) + Number(exp.amount);
    }

    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  // =====================================
  // INVENTORY STATUS
  // =====================================
  async inventoryStatus(shopId: number) {
    const products = await this.productRepo.find({
      where: { shop: { id: shopId } },
    });

    const totalProducts = products.length;
    const lowStockCount = products.filter(
      (p) => p.stock <= p.lowStockLimit,
    ).length;

    const stockValue = products.reduce(
      (sum, p) => sum + Number(p.purchasePrice) * p.stock,
      0,
    );

    return {
      totalProducts,
      lowStockCount,
      stockValue,
    };
  }
}