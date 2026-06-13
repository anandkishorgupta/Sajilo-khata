import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifyPaymentDto } from './dto';
import { PaymentService } from './payment.service';
import { Public } from '../auth/decorators/public.decorator';
import { SkipSubscription } from '../auth/decorators/skip-subscription.decorator';

// payments/payments.controller.ts
@Controller('payments')
// @UseGuards(JwtAuthGuard) // done in app.module.ts globally
export class PaymentController {
    constructor(private paymentsService: PaymentService) { }

    @Post('initiate')
    @SkipSubscription()
    initiate(@CurrentUser() user: any) {
        console.log("Initiating payment for shopId:", user);
        return this.paymentsService.initiate(user.shopId, user.userId);
    }

    @Post('verify')
    @SkipSubscription()
    verify(@Body() dto: VerifyPaymentDto, @CurrentUser() user: any) {
        console.log("Verifying payment for shopId:", user.shopId, "with pidx:", dto.pidx);
        return this.paymentsService.verify(dto.pidx, user.shopId);
    }
}