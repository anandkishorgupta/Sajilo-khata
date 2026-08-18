import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from './entities/admin.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Shop } from '../shops/entities';
import { User } from '../users/entities';
import { Sale } from '../sales/entities/sales.entity';
import { Purchase } from '../purchases/entities';
import { Payment } from '../payment/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, Shop, User, Sale, Purchase, Payment, Expense]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
