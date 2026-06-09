import { Type } from "class-transformer";
import {
    IsNumber,
    IsOptional,
    IsString,
    IsDateString,
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

    // 👇 NEW FIELD
    @IsDateString()
    date: string; // format: "2026-06-09"
}