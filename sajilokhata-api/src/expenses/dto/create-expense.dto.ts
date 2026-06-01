import { Type } from "class-transformer";

import {
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateExpenseDto {
    @IsString()
    title: string;

    @Type(() => Number)
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    note?: string;
}