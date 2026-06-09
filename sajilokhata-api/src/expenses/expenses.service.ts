import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Shop } from "../shops/entities/shop.entity";
import { User } from "../users/entities/user.entity";
import { Expense } from "./entities";

import { CreateExpenseDto } from "./dto";

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,

        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,
    ) { }

    // =====================================
    // CREATE EXPENSE
    // =====================================
    async create(
        dto: CreateExpenseDto,
        shopId: number,
    ) {

        const shop = await this.shopRepo.findOne({
            where: {
                id: shopId,
            },
        });

        if (!shop) {
            throw new NotFoundException(
                "Shop not found",
            );
        }

        const expense =
            this.expenseRepo.create({
                shop: {
                    id: shopId,
                } as Shop,
                title: dto.title,
                amount: dto.amount,
                category: dto.category,
                note: dto.note,
                date: dto.date ?? new Date().toISOString().split("T")[0],
            });
        console.log(expense)
        return this.expenseRepo.save(expense);
    }

    // =====================================
    // GET ALL EXPENSES
    // =====================================
    async findAll(shopId: number) {
        return this.expenseRepo.find({
            where: {
                shop: {
                    id: shopId,
                },
            },

           
            order: {
                createdAt: "DESC",
            },
        });
    }

    // =====================================
    // GET SINGLE EXPENSE
    // =====================================
    async findOne(
        id: number,
        shopId: number,
    ) {
        const expense =
            await this.expenseRepo.findOne({
                where: {
                    id,

                    shop: {
                        id: shopId,
                    },
                },

               
            });

        if (!expense) {
            throw new NotFoundException(
                "Expense not found",
            );
        }

        return expense;
    }

    // =====================================
    // DELETE EXPENSE
    // =====================================
    async remove(
        id: number,
        shopId: number,
    ) {
        const expense =
            await this.findOne(id, shopId);

        return this.expenseRepo.remove(
            expense,
        );
    }
}