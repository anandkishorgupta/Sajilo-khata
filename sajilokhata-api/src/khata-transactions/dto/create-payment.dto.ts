import {
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

import { Type } from "class-transformer";

export class CreatePaymentDto {
    @Type(() => Number)
    @IsNumber()
    customerId: number;

    @Type(() => Number)
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    note?: string;
}