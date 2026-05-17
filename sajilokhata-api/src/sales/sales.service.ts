import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Transactional } from "typeorm-transactional";
import { Customer } from "../customers/entities";
import { KhataTransaction } from "../khata-transactions/entities";
import { Product } from "../products/entities";
import { Shop } from "../shops/entities";
import { StockMovement } from "../stock-movements/entities";
import { User } from "../users/entities";
import { CreateSaleDto } from "./dto";
import { Sale, SaleItem } from "./entities";

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private saleRepo: Repository<Sale>,

        @InjectRepository(Product)
        private productRepo: Repository<Product>,

        @InjectRepository(Customer)
        private customerRepo: Repository<Customer>,

        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,

        @InjectRepository(SaleItem)
        private saleItemRepo: Repository<SaleItem>,

        @InjectRepository(StockMovement)
        private stockMovementRepo: Repository<StockMovement>,

        @InjectRepository(KhataTransaction)
        private khataRepo: Repository<KhataTransaction>,
    ) { }

    // =========================
    // CREATE SALE
    // =========================
    @Transactional()
    async create(dto: CreateSaleDto, shopId: number, userId: number) {
        const shop = await this.shopRepo.findOne({
            where: { id: shopId },
        });

        if (!shop) throw new NotFoundException("Shop not found");

        // =========================
        // CUSTOMER (OPTIONAL)
        // =========================
        let customer: Customer | null = null;

        if (dto.customerId) {
            const found = await this.customerRepo.findOne({
                where: {
                    id: dto.customerId,
                    shop: { id: shopId },
                },
            });

            if (!found) throw new NotFoundException("Customer not found");

            customer = found;
        }

        let subtotal = 0;
        const saleItems: SaleItem[] = [];

        // =========================
        // PROCESS ITEMS
        // =========================
        for (const item of dto.items) {
            const product = await this.productRepo.findOne({
                where: {
                    id: item.productId,
                    shop: { id: shopId },
                },
            });

            if (!product) {
                throw new NotFoundException(
                    `Product ${item.productId} not found`,
                );
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(
                    `${product.name} stock is insufficient`,
                );
            }

            const itemSubtotal = item.unitPrice * item.quantity;
            subtotal += itemSubtotal;

            const profit =
                (item.unitPrice - Number(product.purchasePrice)) *
                item.quantity;

            const saleItem = this.saleItemRepo.create({
                product: { id: product.id } as Product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                purchasePrice: product.purchasePrice,
                subtotal: itemSubtotal,
                profit,
            });

            saleItems.push(saleItem);

            // =========================
            // STOCK REDUCTION
            // =========================
            product.stock -= item.quantity;
            await this.productRepo.save(product);

            await this.stockMovementRepo.save({
                shop: { id: shopId } as Shop,
                product: { id: product.id } as Product,
                type: "out",
                quantity: item.quantity,
            });
        }

        // =========================
        // CALCULATION
        // =========================
        const discount = dto.discount ?? 0;
        const tax = dto.tax ?? 0;

        const totalAmount = subtotal - discount + tax;
        const paidAmount = dto.paidAmount ?? totalAmount;
        const dueAmount = totalAmount - paidAmount;

        const paymentStatus =
            dueAmount <= 0
                ? "paid"
                : paidAmount > 0
                    ? "partial"
                    : "due";

        const invoiceNumber = `INV-${Date.now()}`;

        // =========================
        // CREATE SALE
        // =========================
        const sale = this.saleRepo.create({
            shop: { id: shopId } as Shop,
            user: { id: userId } as User,

            customer: customer
                ? ({ id: customer.id } as Customer)
                : undefined,

            invoiceNumber,
            subtotal,
            discount,
            tax,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMethod: dto.paymentMethod,
            paymentStatus,
            note: dto.note,

            items: saleItems,
        });

        const savedSale = await this.saleRepo.save(sale);

        // =========================
        // KHATA ENTRY (ONLY IF DUE + CUSTOMER EXISTS)
        // =========================
        if (customer && dueAmount > 0) {
            await this.khataRepo.save({
                shop: { id: shopId } as Shop,
                customer: { id: customer.id } as Customer,
                type: "credit",
                amount: dueAmount,
                note: `Due from invoice ${invoiceNumber}`,
            });
        }

        return savedSale;
    }

    // =========================
    // GET ALL SALES
    // =========================
    async findAll(shopId: number) {
        return this.saleRepo.find({
            where: { shop: { id: shopId } },
            relations: {
                customer: true,
                items: { product: true },
            },
            order: { createdAt: "DESC" },
        });
    }

    // =========================
    // GET SINGLE SALE
    // =========================
    async findOne(id: number, shopId: number) {
        const sale = await this.saleRepo.findOne({
            where: {
                id,
                shop: { id: shopId },
            },
            relations: {
                customer: true,
                items: { product: true },
            },
        });

        if (!sale) throw new NotFoundException("Sale not found");

        return sale;
    }

    // =========================
    // DELETE SALE (RESTORE STOCK)
    // =========================
    @Transactional()
    async remove(id: number, shopId: number) {
        const sale = await this.findOne(id, shopId);

        for (const item of sale.items) {
            const product = await this.productRepo.findOne({
                where: { id: item.product.id },
            });

            if (!product) continue;

            product.stock += item.quantity;
            await this.productRepo.save(product);

            await this.stockMovementRepo.save({
                shop: { id: shopId } as Shop,
                product: { id: product.id } as Product,
                type: "in",
                quantity: item.quantity,
            });
        }

        return this.saleRepo.remove(sale);
    }
}