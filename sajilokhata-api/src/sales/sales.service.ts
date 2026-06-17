import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";

import { Transactional } from "typeorm-transactional";
import { Customer } from "../customers/entities";
import { KhataTransaction } from "../khata-transactions/entities";
import { Product } from "../products/entities";
import { Shop } from "../shops/entities";
import { StockMovement } from "../stock-movements/entities";
import { User } from "../users/entities";
import { CreateSaleDto, FindSalesDto } from "./dto";
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

            product.stock -= item.quantity;
            await this.productRepo.save(product);

            await this.stockMovementRepo.save({
                shop: { id: shopId } as Shop,
                product: { id: product.id } as Product,
                type: "out",
                quantity: item.quantity,
                referenceType: "sale",
            });
        }

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

        if (customer && dueAmount > 0) {
            await this.khataRepo.save({
                shop: { id: shopId } as Shop,
                customer: { id: customer.id } as Customer,
                type: "credit",
                amount: dueAmount,
                note: `Due from invoice ${invoiceNumber}`,
                sale: { id: savedSale.id } as Sale,
            });
        }

        return savedSale;
    }

    // =========================
    // Helper: resolve date range
    // =========================
    private resolveDateRange(query: FindSalesDto): { from?: Date; to?: Date } {
        const now = new Date();

        if (query.range) {
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);

            switch (query.range) {
                case 'today': {
                    const end = new Date(startOfToday);
                    end.setHours(23, 59, 59, 999);
                    return { from: startOfToday, to: end };
                }
                case 'yesterday': {
                    const start = new Date(startOfToday);
                    start.setDate(start.getDate() - 1);
                    const end = new Date(start);
                    end.setHours(23, 59, 59, 999);
                    return { from: start, to: end };
                }
                case 'week': {
                    const start = new Date(startOfToday);
                    start.setDate(start.getDate() - 6); // last 7 days incl. today
                    const end = new Date(now);
                    end.setHours(23, 59, 59, 999);
                    return { from: start, to: end };
                }
                case 'month': {
                    const start = new Date(startOfToday);
                    start.setDate(start.getDate() - 29); // last 30 days incl. today
                    const end = new Date(now);
                    end.setHours(23, 59, 59, 999);
                    return { from: start, to: end };
                }
            }
        }

        let from: Date | undefined;
        let to: Date | undefined;

        if (query.fromDate) {
            from = new Date(query.fromDate);
            from.setHours(0, 0, 0, 0);
        }

        if (query.toDate) {
            to = new Date(query.toDate);
            to.setHours(23, 59, 59, 999);
        }

        return { from, to };
    }

    // =========================
    // GET ALL SALES (filtered + paginated)
    // =========================
    async findAll(shopId: number, query: FindSalesDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const qb = this.saleRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.customer', 'customer')
            .leftJoinAndSelect('sale.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .where('sale.shop_id = :shopId', { shopId })
        const { from, to } = this.resolveDateRange(query);

        if (from) {
            qb.andWhere('sale.createdAt >= :from', { from });
        }
        if (to) {
            qb.andWhere('sale.createdAt <= :to', { to });
        }

        if (query.paymentMethod) {
            qb.andWhere('sale.paymentMethod = :paymentMethod', {
                paymentMethod: query.paymentMethod,
            });
        }

        if (query.paymentStatus) {
            qb.andWhere('sale.paymentStatus = :paymentStatus', {
                paymentStatus: query.paymentStatus,
            });
        }

        if (query.search) {
            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        .where('sale.invoiceNumber ILIKE :search', {
                            search: `%${query.search}%`,
                        })
                        .orWhere('customer.name ILIKE :search', {
                            search: `%${query.search}%`,
                        })
                        .orWhere('customer.phone ILIKE :search', {
                            search: `%${query.search}%`,
                        });
                }),
            );
        }

        qb.orderBy('sale.createdAt', 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // =========================
    // GET SALES SUMMARY (stats cards)
    // =========================
    async getSummary(shopId: number, query: FindSalesDto) {
        const qb = this.saleRepo
            .createQueryBuilder('sale')
            .leftJoin('sale.customer', 'customer')
            .where('sale.shop_id = :shopId', { shopId })

        const { from, to } = this.resolveDateRange(query);

        if (from) qb.andWhere('sale.createdAt >= :from', { from });
        if (to) qb.andWhere('sale.createdAt <= :to', { to });

        if (query.search) {
            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        .where('sale.invoiceNumber ILIKE :search', {
                            search: `%${query.search}%`,
                        })
                        .orWhere('customer.name ILIKE :search', {
                            search: `%${query.search}%`,
                        });
                }),
            );
        }

        const result = await qb
            .select('COUNT(sale.id)', 'totalBills')
            .addSelect('COALESCE(SUM(sale.totalAmount), 0)', 'totalSales')
            .addSelect('COALESCE(SUM(sale.paidAmount), 0)', 'totalPaid')
            .addSelect('COALESCE(SUM(sale.dueAmount), 0)', 'totalDue')
            .addSelect(
                `COALESCE(SUM(CASE WHEN sale.paymentMethod IN ('cash','qr','bank') THEN sale.paidAmount ELSE 0 END), 0)`,
                'cashReceived',
            )
            .addSelect(
                `COUNT(CASE WHEN sale.paymentStatus = 'due' THEN 1 END)`,
                'dueBillsCount',
            )
            .getRawOne();

        return {
            totalBills: Number(result.totalBills),
            totalSales: Number(result.totalSales),
            totalPaid: Number(result.totalPaid),
            totalDue: Number(result.totalDue),
            cashReceived: Number(result.cashReceived),
            dueBillsCount: Number(result.dueBillsCount),
        };
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
                referenceType: "sale_delete",
            });
        }

        // Remove related khata credit entries tied to this sale, if any
        await this.khataRepo.delete({ sale: { id: sale.id } });

        return this.saleRepo.remove(sale);
    }
}