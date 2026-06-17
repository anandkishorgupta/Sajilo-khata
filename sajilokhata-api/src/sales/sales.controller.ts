import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateSaleDto, FindSalesDto } from './dto';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
    ) { }

    // CREATE SALE
    @Post()
    create(
        @Body() dto: CreateSaleDto,
        @CurrentUser() user: any,
    ) {
        return this.salesService.create(dto, user.shopId, user.userId);
    }

    // GET ALL SALES (filtered + paginated)
    @Get()
    findAll(
        @Query() query: FindSalesDto,
        @CurrentUser() user: any,
    ) {
        console.log("User...", user);
        return this.salesService.findAll(user.shopId, query);
    }

    // GET SALES SUMMARY (for stat cards)
    @Get('summary')
    getSummary(
        @Query() query: FindSalesDto,
        @CurrentUser() user: any,
    ) {
        return this.salesService.getSummary(user.shopId, query);
    }

    // GET SINGLE SALE
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.salesService.findOne(id, user.shopId);
    }

    // DELETE SALE
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.salesService.remove(id, user.shopId);
    }
}