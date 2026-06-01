import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { KhataTransaction } from "./entities";
import { Customer } from "../customers/entities";
import { Shop } from "../shops/entities";

import { CreatePaymentDto } from "./dto";

@Injectable()
export class KhataTransactionsService {
    constructor(
        @InjectRepository(KhataTransaction)
        private khataRepo: Repository<KhataTransaction>,

        @InjectRepository(Customer)
        private customerRepo: Repository<Customer>,

        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,
    ) { }

    // =====================================
    // CREATE PAYMENT
    // =====================================
    async createPayment(
        dto: CreatePaymentDto,
        shopId: number,
    ) {
        const customer =
            await this.customerRepo.findOne({
                where: {
                    id: dto.customerId,
                    shop: {
                        id: shopId,
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                "Customer not found",
            );
        }

        // =====================================
        // CHECK CURRENT DUE
        // =====================================
        const balance =
            await this.getCustomerBalance(
                dto.customerId,
                shopId,
            );

        if (dto.amount > balance.balance) {
            throw new BadRequestException(
                "Payment exceeds due amount",
            );
        }

        // =====================================
        // CREATE PAYMENT ENTRY
        // =====================================
        const payment = this.khataRepo.create({
            shop: {
                id: shopId,
            } as Shop,

            customer: {
                id: customer.id,
            } as Customer,

            type: "payment",

            amount: dto.amount,

            note: dto.note,
        });

        return this.khataRepo.save(payment);
    }

    // =====================================
    // CUSTOMER LEDGER
    // =====================================
    async getCustomerLedger(
        customerId: number,
        shopId: number,
    ) {
        const customer =
            await this.customerRepo.findOne({
                where: {
                    id: customerId,
                    shop: {
                        id: shopId,
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                "Customer not found",
            );
        }

        const transactions =
            await this.khataRepo.find({
                where: {
                    customer: {
                        id: customerId,
                    },

                    shop: {
                        id: shopId,
                    },
                },

                relations: {
                    sale: true,
                },

                order: {
                    createdAt: "DESC",
                },
            });

        return transactions;
    }

    // =====================================
    // CUSTOMER BALANCE
    // =====================================
    async getCustomerBalance(
        customerId: number,
        shopId: number,
    ) {
        const transactions =
            await this.khataRepo.find({
                where: {
                    customer: {
                        id: customerId,
                    },

                    shop: {
                        id: shopId,
                    },
                },
            });

        let totalCredit = 0;
        let totalPayment = 0;

        for (const tx of transactions) {
            if (tx.type === "credit") {
                totalCredit += Number(tx.amount);
            }

            if (tx.type === "payment") {
                totalPayment += Number(tx.amount);
            }
        }

        return {
            totalCredit,
            totalPayment,

            balance:
                totalCredit - totalPayment,
        };
    }

    // =====================================
    // ALL KHATA CUSTOMERS
    // =====================================
    async findAll(shopId: number) {
        const customers =
            await this.customerRepo.find({
                where: {
                    shop: {
                        id: shopId,
                    },
                },
            });

        const result: {
            customer: Customer;
            balance: number;
        }[] = [];

        for (const customer of customers) {
            const balance =
                await this.getCustomerBalance(
                    customer.id,
                    shopId,
                );

            if (balance.balance > 0) {
                result.push({
                    customer,
                    balance:
                        balance.balance,
                });
            }
        }

        return result;
    }
}