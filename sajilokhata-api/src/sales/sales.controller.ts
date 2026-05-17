import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateSaleDto } from './dto';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard) // Apply JWT auth guard to all routes in this controller
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
    ) { }

    // CREATE SALE
    @Post()
    create(
        @Body()
        dto: CreateSaleDto,
        @CurrentUser()
        user: any,
    ) {
        return this.salesService.create(
            dto,
            user.shopId,
            user.userId,
        );
    }

    // GET ALL SALES
    @Get()
    findAll(
        @CurrentUser()
        user: any,
    ) {
        return this.salesService.findAll(
            user.shopId,
        );
    }

    // GET SINGLE SALE
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,

        @CurrentUser()
        user: any,
    ) {
        return this.salesService.findOne(
            id,
            user.shopId,
        );
    }

    // DELETE SALE
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,

        @CurrentUser()
        user: any,
    ) {
        return this.salesService.remove(
            id,
            user.shopId,
        );
    }
}