import { Type } from "class-transformer";
import {
    IsNumber,
    IsPositive
} from "class-validator";

export class CreatePurchaseItemDto {
    @Type(() => Number)
    @IsNumber()
    productId: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    quantity: number;

    @Type(() => Number)
    @IsNumber()
    unitPrice: number;
}