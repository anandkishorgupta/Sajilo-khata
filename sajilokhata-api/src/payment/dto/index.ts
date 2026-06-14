import { IsNotEmpty, IsString } from "class-validator";

import { IsInt } from 'class-validator';

export class InitiatePaymentDto {
  @IsInt()
  planId: number;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  pidx: string;
}