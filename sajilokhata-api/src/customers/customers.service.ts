
import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Customer } from "./entities/customer.entity";

import {
    CreateCustomerDto,
    UpdateCustomerDto,
} from "./dto";

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customerRepo: Repository<Customer>,
    ) { }

    // CREATE CUSTOMER
    async create(
        dto: CreateCustomerDto,
        shopId: number,
    ) {
        const customer =
            this.customerRepo.create({
                ...dto,

                shop: {
                    id: shopId,
                },
            });

        return this.customerRepo.save(customer);
    }

    // GET ALL CUSTOMERS
    async findAll(shopId: number) {
        return this.customerRepo.find({
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

    // GET SINGLE CUSTOMER
    async findOne(
        id: number,
        shopId: number,
    ) {
        const customer =
            await this.customerRepo.findOne({
                where: {
                    id,

                    shop: {
                        id: shopId,
                    },
                },

                relations: {
                    sales: true,
                    khataTransactions: true,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                "Customer not found",
            );
        }

        return customer;
    }

    // UPDATE CUSTOMER
    async update(
        id: number,
        dto: UpdateCustomerDto,
        shopId: number,
    ) {
        const customer = await this.findOne(
            id,
            shopId,
        );

        Object.assign(customer, dto);

        return this.customerRepo.save(customer);
    }

    // DELETE CUSTOMER
    async remove(
        id: number,
        shopId: number,
    ) {
        const customer = await this.findOne(
            id,
            shopId,
        );

        return this.customerRepo.remove(customer);
    }
}