import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities';
import { Payment } from './entities';

// payments/payments.service.ts
@Injectable()
export class PaymentService {
    private readonly khaltiUrl: string;
    private readonly secretKey: string;
    private readonly amount: number;
    private readonly frontendUrl: string;
    private readonly durationDays: number;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    ) {
        this.khaltiUrl = this.configService.getOrThrow('KHALTI_GATEWAY_URL');
        this.secretKey = this.configService.getOrThrow('KHALTI_SECRET_KEY');
        this.amount = Number(
            this.configService.getOrThrow('PRO_PLAN_AMOUNT'),
        );

        this.frontendUrl =
            this.configService.getOrThrow('FRONTEND_URL');

        this.durationDays = Number(
            this.configService.getOrThrow('PRO_PLAN_DURATION_DAYS'),
        );
    }

    // ── STEP 1: Initiate ──────────────────────────────────
    async initiate(shopId: number) {
        // const amount = 1000; // Rs 10 in paisa — hardcode for now, plan table later
        const purchaseOrderId = `SHOP-${shopId}-${Date.now()}`; // generate once
        const response = await fetch(`${this.khaltiUrl}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                return_url: `${this.frontendUrl}/payment/verify`, // your frontend verify page
                website_url: this.frontendUrl,
                amount: this.amount * 100,                          // in paisa
                purchase_order_id: purchaseOrderId,
                purchase_order_name: 'Sajilo Khata Pro Plan',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new BadRequestException(data);
        }

        // Save pending payment record
        await this.paymentRepo.save(
            this.paymentRepo.create({
                shop: { id: shopId },
                pidx: data.pidx,
                amount: this.amount * 100,
                status: 'pending',
                purchaseOrderId,
            })
        );

        return {
            pidx: data.pidx,
            payment_url: data.payment_url, // redirect user here
        };
    }

    // ── STEP 2: Verify ────────────────────────────────────
    async verify(pidx: string) {
        // 1. Call Khalti to verify
        const response = await fetch(`${this.khaltiUrl}/epayment/lookup/`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pidx }),
        });
        console.log("Khalti verification response status:....................", response)
        const data = await response.json();

        // if (!response.ok) {
        //     throw new BadRequestException('Payment verification failed');
        // }

        // 2. Find the pending payment
        const payment = await this.paymentRepo.findOne({
            where: { pidx },
            relations: ['shop'],
        });

        if (!payment) {
            throw new NotFoundException('Payment record not found');
        }
        if (payment.status === 'completed') {
            return {
                message: 'Payment already verified',
            };
        }
        // 3. Check Khalti says it's completed
        if (data.status !== 'Completed') {
            payment.status = 'failed';
            await this.paymentRepo.save(payment);
            throw new BadRequestException('Payment not completed');
        }

        // 4. Update payment record
        payment.status = 'completed';
        payment.transactionId = data.transaction_id;
        await this.paymentRepo.save(payment);

        // 5. Activate the shop — 30 days from now
        const shop = payment.shop;
        if (!shop) {
            throw new NotFoundException('Shop not found');
        }
        const now = new Date();

        const baseDate =
            shop?.expiresAt && shop.expiresAt > now
                ? shop.expiresAt
                : now;

        

        const expiresAt = new Date(
            baseDate.getTime() +
            this.durationDays * 24 * 60 * 60 * 1000,
        );

        await this.shopRepo.update(payment.shop.id, {
            plan: 'pro',
            expiresAt,
        });

        return { message: 'Payment verified. Shop activated!' };
    }
}