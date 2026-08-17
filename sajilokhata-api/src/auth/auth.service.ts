import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Shop } from '../shops/entities';
import { User } from '../users/entities';
import { LoginDto, RegisterDto } from './dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,

        private jwtService: JwtService,

        private readonly auditLogService: AuditLogService,
    ) { }
    generateToken(user: User) {
        return this.jwtService.sign({
            sub: user.id,
            shopId: user.shop?.id,
            email: user.email,
            role: user.role,
        });
    }

    // 🟢 REGISTER SHOP + OWNER
    @Transactional()
    async register(dto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 1. Create Shop
        const shop = this.shopRepo.create({
            name: dto.shopName,
            address: dto.shopAddress,
            phone: dto.shopPhone,
            plan: 'trial',
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
        });

        const savedShop = await this.shopRepo.save(shop);

        // 2. Create User (OWNER)
        const user = this.userRepo.create({
            email: dto.email,
            name: dto.name,
            password: hashedPassword,
            shop: savedShop,
            role: 'owner',
        });

        const savedUser = await this.userRepo.save(user);

        // const accessToken = this.generateToken(savedUser);

        return {
            user: {
                id: savedUser.id,
                email: savedUser.email,
                name: savedUser.name,
                role: savedUser.role,
            },
            shop: {
                id: savedShop.id,
                name: savedShop.name,
                plan: savedShop.plan,
                expiresAt: savedShop.expiresAt,
            },
        };
    }

    // login
    async login(dto: LoginDto) {
        // 1. find user
        const user = await this.userRepo.findOne({
            where: { email: dto.email },
            relations: ['shop'],
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // 2. check password
        const isMatch = await bcrypt.compare(dto.password, user.password);

        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const accessToken = this.generateToken(user);

        this.auditLogService.log({
            shopId: user.shop.id,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'LOGIN',
            entityType: 'Auth',
            entityId: user.id,
            description: `${user.name} (${user.role}) logged in`,
        }).catch((err) => this.logger.error('Audit log failed', err));

        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            shop: {
                id: user.shop.id,
                name: user.shop.name,
                plan: user.shop.plan,
                expiresAt: user.shop.expiresAt,
            },
        }
    }
}