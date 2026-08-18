import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Shop } from '../shops/entities';
import { User } from '../users/entities';
import { Sale } from '../sales/entities/sales.entity';
import { Purchase } from '../purchases/entities';
import { Payment } from '../payment/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin) private adminRepo: Repository<Admin>,
        @InjectRepository(Shop) private shopRepo: Repository<Shop>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Sale) private saleRepo: Repository<Sale>,
        @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
        private jwtService: JwtService,
    ) {}

    async login(dto: AdminLoginDto) {
        const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
        if (!admin) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, admin.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const token = this.jwtService.sign({
            sub: admin.id,
            email: admin.email,
            role: 'admin',
        });

        return {
            access_token: token,
            admin: { id: admin.id, name: admin.name, email: admin.email },
        };
    }

    async getStats() {
        const totalShops = await this.shopRepo.count();
        const activeShops = await this.shopRepo.count({
            where: { expiresAt: MoreThan(new Date()) },
        });
        const expiredShops = totalShops - activeShops;
        const totalUsers = await this.userRepo.count();
        const totalSales = await this.saleRepo
            .createQueryBuilder('sale')
            .select('COALESCE(SUM(sale.total_amount), 0)', 'total')
            .getRawOne();
        const totalPurchases = await this.purchaseRepo
            .createQueryBuilder('purchase')
            .select('COALESCE(SUM(purchase.total_amount), 0)', 'total')
            .getRawOne();
        const totalExpenses = await this.expenseRepo
            .createQueryBuilder('expense')
            .select('COALESCE(SUM(expense.amount), 0)', 'total')
            .getRawOne();
        const totalPayments = await this.paymentRepo
            .createQueryBuilder('payment')
            .select('COALESCE(SUM(payment.amount), 0)', 'total')
            .getRawOne();
        const completedPayments = await this.paymentRepo.count({
            where: { status: 'completed' },
        });

        return {
            totalShops,
            activeShops,
            expiredShops,
            totalUsers,
            totalSales: Number(totalSales?.total ?? 0),
            totalPurchases: Number(totalPurchases?.total ?? 0),
            totalExpenses: Number(totalExpenses?.total ?? 0),
            totalPayments: Number(totalPayments?.total ?? 0),
            completedPayments,
        };
    }

    async getShops(query: { search?: string; plan?: string; page?: number; limit?: number }) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const qb = this.shopRepo.createQueryBuilder('shop')
            .leftJoinAndSelect('shop.users', 'users');

        if (query.search) {
            qb.andWhere('(shop.name ILIKE :search OR shop.phone ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }

        if (query.plan) {
            qb.andWhere('shop.plan = :plan', { plan: query.plan });
        }

        qb.orderBy('shop.created_at', 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data: data.map((shop) => ({
                id: shop.id,
                name: shop.name,
                address: shop.address,
                phone: shop.phone,
                plan: shop.plan,
                expiresAt: shop.expiresAt,
                createdAt: shop.createdAt,
                userCount: shop.users?.length ?? 0,
                isExpired: shop.expiresAt ? new Date(shop.expiresAt) < new Date() : true,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getShopDetail(shopId: number) {
        const shop = await this.shopRepo.findOne({
            where: { id: shopId },
            relations: ['users'],
        });
        if (!shop) throw new Error('Shop not found');

        const totalSales = await this.saleRepo
            .createQueryBuilder('sale')
            .where('sale.shop_id = :shopId', { shopId })
            .select('COALESCE(SUM(sale.total_amount), 0)', 'total')
            .getRawOne();

        return {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            plan: shop.plan,
            expiresAt: shop.expiresAt,
            createdAt: shop.createdAt,
            users: shop.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
            totalSales: Number(totalSales?.total ?? 0),
            isExpired: shop.expiresAt ? new Date(shop.expiresAt) < new Date() : true,
        };
    }

    async extendShop(shopId: number, durationDays: number, plan?: string) {
        const shop = await this.shopRepo.findOne({ where: { id: shopId } });
        if (!shop) throw new Error('Shop not found');

        const now = new Date();
        const baseDate = shop.expiresAt && new Date(shop.expiresAt) > now
            ? new Date(shop.expiresAt)
            : now;

        shop.expiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        if (plan) shop.plan = plan;

        await this.shopRepo.save(shop);
        return { message: `Shop extended by ${durationDays} days`, expiresAt: shop.expiresAt };
    }

    async getUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const qb = this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.shop', 'shop');

        if (query.search) {
            qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }

        if (query.role) {
            qb.andWhere('user.role = :role', { role: query.role });
        }

        qb.orderBy('user.created_at', 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data: data.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                shopId: u.shop?.id,
                shopName: u.shop?.name,
                createdAt: u.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getPayments(query: { page?: number; limit?: number; status?: string }) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const qb = this.paymentRepo.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.shop', 'shop');

        if (query.status) {
            qb.andWhere('payment.status = :status', { status: query.status });
        }

        qb.orderBy('payment.created_at', 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data: data.map((p) => ({
                id: p.id,
                pidx: p.pidx,
                amount: p.amount,
                status: p.status,
                transactionId: p.transactionId,
                purchaseOrderId: p.purchaseOrderId,
                shopId: p.shop?.id,
                shopName: p.shop?.name,
                createdAt: p.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
