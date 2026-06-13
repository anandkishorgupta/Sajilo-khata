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

    constructor(
        private configService: ConfigService,
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    ) {
        this.khaltiUrl = this.configService.getOrThrow('KHALTI_GATEWAY_URL');
        this.secretKey = this.configService.getOrThrow('KHALTI_SECRET_KEY');
    }

    // ── STEP 1: Initiate ──────────────────────────────────
    async initiate(shopId: number, userId: number) {
        const amount = 1000; // Rs 10 in paisa — hardcode for now, plan table later

        const response = await fetch(`${this.khaltiUrl}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                return_url: 'http://localhost:5173/payment/verify', // your frontend verify page
                website_url: 'http://localhost:5173',
                amount,                          // in paisa
                purchase_order_id: `SHOP-${shopId}-${Date.now()}`,
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
                amount,
                status: 'pending',
            })
        );

        return {
            pidx: data.pidx,
            payment_url: data.payment_url, // redirect user here
        };
    }

    // ── STEP 2: Verify ────────────────────────────────────
    async verify(pidx: string, shopId: number) {
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

        if (!response.ok) {
            throw new BadRequestException('Payment verification failed');
        }

        // 2. Find the pending payment
        const payment = await this.paymentRepo.findOne({
            where: { pidx, shop: { id: shopId } },
        });

        if (!payment) {
            throw new NotFoundException('Payment record not found');
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
        await this.shopRepo.update(shopId, {
            status: 'active',
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return { message: 'Payment verified. Shop activated!' };
    }
}