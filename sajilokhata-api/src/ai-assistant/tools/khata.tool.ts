import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Customer } from "../../customers/entities";
import { KhataTransaction } from "../../khata-transactions/entities";

@Injectable()
export class KhataTool {
    constructor(
        @InjectRepository(KhataTransaction)
        private khataRepo: Repository<KhataTransaction>,

        @InjectRepository(Customer)
        private customerRepo: Repository<Customer>,
    ) { }

    // ── Total outstanding dues ───────────
    async getTotalDue(shopId: number) {
        const txns = await this.khataRepo.find({
            where: { shop: { id: shopId } },
            select: { id: true, type: true, amount: true },
        });
        const credit = txns
            .filter((t) => t.type === "credit")
            .reduce((s, t) => s + Number(t.amount), 0);
        const payment = txns
            .filter((t) => t.type === "payment")
            .reduce((s, t) => s + Number(t.amount), 0);
        return { totalDue: credit - payment, totalCredit: credit, totalPayment: payment };
    }

    // ── Per-customer dues ────────────────
    async getCustomerDues(shopId: number) {
        const txns = await this.khataRepo.find({
            where: { shop: { id: shopId } },
            relations: { customer: true },
            select: {
                id: true,
                type: true,
                amount: true,
                customer: { id: true, name: true },
            },
        });

        const map = new Map<number, { name: string; due: number }>();
        for (const t of txns) {
            if (!t.customer) continue;
            const e = map.get(t.customer.id) ?? { name: t.customer.name, due: 0 };
            e.due += t.type === "credit" ? Number(t.amount) : -Number(t.amount);
            map.set(t.customer.id, e);
        }

        return [...map.values()]
            .filter((c) => c.due > 0)
            .sort((a, b) => b.due - a.due);
    }

    // ── Overdue customers (due > 0) ──────
    async getOverdueCustomers(shopId: number) {
        return this.getCustomerDues(shopId);
    }
}