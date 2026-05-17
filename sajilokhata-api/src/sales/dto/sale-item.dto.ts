import {
    IsInt,
    IsNumber,
    IsPositive,
} from 'class-validator';

import { Type } from 'class-transformer';

export class SaleItemDto {
    @Type(() => Number)
    @IsInt()
    productId: number;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    quantity: number;

    @Type(() => Number)
    @IsNumber()
    unitPrice: number;
}