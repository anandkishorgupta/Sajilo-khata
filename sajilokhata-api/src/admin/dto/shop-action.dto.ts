import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ExtendShopDto {
    @IsNumber()
    shopId: number;

    @IsNumber()
    durationDays: number;

    @IsOptional()
    @IsString()
    plan?: string;
}

export class ToggleShopDto {
    @IsNumber()
    shopId: number;

    @IsOptional()
    @IsString()
    status?: string;
}
