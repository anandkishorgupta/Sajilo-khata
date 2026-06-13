// payments/dto/index.ts
export class InitiatePaymentDto {
    planId: number; // which plan they're buying
}

export class VerifyPaymentDto {
    pidx: string;
}