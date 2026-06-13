import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities';
import { Payment } from './entities';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
    imports: [TypeOrmModule.forFeature([Payment,Shop])],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule { }