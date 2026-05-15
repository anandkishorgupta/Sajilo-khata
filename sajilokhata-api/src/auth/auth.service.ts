import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities';
import { User } from '../users/entities';
import { LoginDto, RegisterDto } from './dto';
import { Transactional } from 'typeorm-transactional';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,

        private jwtService: JwtService,
    ) { }
    // generate token
    generateToken(user: User) {
        return this.jwtService.sign({
            sub: user.id,
            shopId: user.shop?.id,
            email: user.email,
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
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const savedShop = await this.shopRepo.save(shop);

        // 2. Create User (OWNER)
        const user = this.userRepo.create({
            email: dto.email,
            name: dto.name,
            password: hashedPassword,
            shop: savedShop,
        });

        const savedUser = await this.userRepo.save(user);

        const accessToken = this.generateToken(savedUser);

        return {
            access_token: accessToken,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                name: savedUser.name,
            },
            shop: {
                id: savedShop.id,
                name: savedShop.name,
                status: savedShop.status,
                plan: savedShop.plan,
                trialEndsAt: savedShop.trialEndsAt,
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

        // 3. return token
        const accessToken = this.generateToken(user);
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            shop: {
                id: user.shop.id,
                name: user.shop.name,
                status: user.shop.status,
                plan: user.shop.plan,
                trialEndsAt: user.shop.trialEndsAt,
            },
        }
    }
}