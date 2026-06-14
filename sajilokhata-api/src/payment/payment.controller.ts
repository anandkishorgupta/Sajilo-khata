import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipSubscription } from '../auth/decorators/skip-subscription.decorator';
import { VerifyPaymentDto } from './dto';
import { PaymentService } from './payment.service';

// payments/payments.controller.ts
@Controller('payments')
// @UseGuards(JwtAuthGuard) // done in app.module.ts globally
export class PaymentController {
    constructor(private paymentsService: PaymentService) { }

    @Post('initiate')
    @SkipSubscription() // skip subscription check for initiating payment
    initiate(@CurrentUser() user: any) {
        return this.paymentsService.initiate(user.shopId);
    }

    @Post('verify')
    @SkipSubscription()
    verify(@Body() dto: VerifyPaymentDto) {
        return this.paymentsService.verify(dto.pidx);
    }
}