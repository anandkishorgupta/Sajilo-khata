import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {

    constructor(
        private readonly productService: ProductsService,
    ) { }

    // CREATE PRODUCT
    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    create(
        @Body()
        dto: CreateProductDto,
        @CurrentUser()
        user: any,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.productService.create(
            dto,
            user.shopId,
            file
        );
    }

    // GET ALL PRODUCTS with pagination, search, category filter, stock filter, sorting
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(
        @CurrentUser() user: any,

        @Query("page") page?: number,
        @Query("limit") limit?: number,

        @Query("search") search?: string,
        @Query("category") category?: string,
        @Query("stockFilter") stockFilter?: string,

        @Query("sortBy") sortBy?: string,
        @Query("sortOrder") sortOrder?: "ASC" | "DESC",
    ) {
        return this.productService.findAll(user.shopId, {
            page,
            limit,
            search,
            category,
            stockFilter,
            sortBy,
            sortOrder,
        });
    }

    // get stats
    @Get("stats")
    @UseGuards(JwtAuthGuard)
    getStats(@CurrentUser() user: any) {
        return this.productService.getStats(user.shopId)
    }


    // LOW STOCK PRODUCTS
    @Get('low-stock')
    @UseGuards(JwtAuthGuard)
    lowStock(
        @CurrentUser()
        user: any,
    ) {
        return this.productService.lowStock(
            user.shopId,
        );
    }

    // GET SINGLE PRODUCT
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(
        @Param('id', ParseIntPipe)
        id: number,

        @CurrentUser()
        user: any,
    ) {
        return this.productService.findOne(
            id,
            user.shopId,
        );
    }

    // UPDATE PRODUCT
    @Put(":id")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("image"))
    update(
        @Param("id", ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateProductDto,

        @CurrentUser()
        user: any,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.productService.update(
            id,
            dto,
            user.shopId,
            file,
        );
    }

    // DELETE PRODUCT
    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    remove(
        @Param("id", ParseIntPipe)
        id: number,

        @CurrentUser()
        user: any,
    ) {
        return this.productService.remove(
            id,
            user.shopId,
        );
    }
}

