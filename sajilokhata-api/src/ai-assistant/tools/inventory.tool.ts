import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Customer } from "../../customers/entities";
import { Product } from "../../products/entities";

@Injectable()
export class InventoryTool {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @InjectRepository(Customer)
        private customerRepo: Repository<Customer>,
    ) { }

    // ── Low stock products ───────────────
    async getLowStock(shopId: number) {
        const products = await this.productRepo.find({
            where: { shop: { id: shopId } },
            select: { id: true, name: true, stock: true, lowStockLimit: true },
        });
        return products.filter((p) => p.stock <= p.lowStockLimit);
    }

    // ── Full product catalog ─────────────
    async getProductCatalog(shopId: number) {
        return this.productRepo.find({
            where: { shop: { id: shopId }, isActive: true },
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                purchasePrice: true,
                stock: true,
            },
        });
    }

    // ── Inventory value summary ──────────
    async getInventoryValue(shopId: number) {
        const products = await this.productRepo.find({
            where: { shop: { id: shopId }, isActive: true },
            select: { id: true, name: true, stock: true, purchasePrice: true, sellingPrice: true },
        });

        const totalCostValue = products.reduce(
            (s, p) => s + Number(p.stock) * Number(p.purchasePrice),
            0,
        );
        const totalSaleValue = products.reduce(
            (s, p) => s + Number(p.stock) * Number(p.sellingPrice),
            0,
        );

        return {
            totalProducts: products.length,
            totalCostValue,
            totalSaleValue,
            potentialProfit: totalSaleValue - totalCostValue,
        };
    }

    // ── Customer list ────────────────────
    async getCustomerList(shopId: number) {
        return this.customerRepo.find({
            where: { shop: { id: shopId } },
            select: { id: true, name: true, phone: true },
        });
    }
}