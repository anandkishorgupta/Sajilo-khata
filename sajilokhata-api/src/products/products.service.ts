import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Product } from './entities';
import { ImageKitService } from '../imagekit/imagekit.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
        @InjectRepository(Shop)
        private shopRepo: Repository<Shop>,
        private imageKitService: ImageKitService,
    ) { }

    // CREATE PRODUCT
    async create(
        dto: CreateProductDto,
        shopId: number,
        file?: Express.Multer.File
    ) {
        // const shop = await this.shopRepo.findOne({ where: { id: shopId } });
        // if (!shop) {
        //     throw new NotFoundException(`Shop with id ${shopId} not found`);
        // }
        // const product = this.productRepo.create({ ...dto, shop });
        // return this.productRepo.save(product);

        let imageData: { url?: string; fileId?: string } = {};

        if (file) {
            imageData = await this.imageKitService.upload(file);
        }
        const product = this.productRepo.create({
            ...dto,
            shop: {
                id: shopId,
            },
            imageUrl: imageData.url,
            imageFileId: imageData.fileId,
        });

        return this.productRepo.save(product);
    }

    // GET ALL PRODUCTS OF A SHOP
    async findAll(shopId: number) {
        return this.productRepo.find({
            where: {
                shop: {
                    id: shopId,
                },
            },
            //   relations: {
            //     shop: true,
            //   },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    // GET SINGLE PRODUCT
    async findOne(
        id: number, // product id
        shopId: number,
    ) {
        const product = await this.productRepo.findOne({
            where: {
                id,
                shop: {
                    id: shopId,
                },
            },
            // relations: {
            //     shop: true,
            // },
        });

        if (!product) {
            throw new NotFoundException(
                'Product not found',
            );
        }

        return product;
    }

    // UPDATE PRODUCT
    async update(
        id: number,
        dto: UpdateProductDto,
        shopId: number,
        file?: Express.Multer.File,
    ) {
        const product = await this.findOne(
            id,
            shopId,
        );

        // upload new image
        if (file) {
            // delete old image first
            if (product.imageFileId) {
                await this.imageKitService.deleteFile(
                    product.imageFileId,
                );
            }

            // upload new image
            const imageData =
                await this.imageKitService.upload(file);

            product.imageUrl = imageData.url;
            product.imageFileId = imageData.fileId;
        }

        Object.assign(product, dto);

        return this.productRepo.save(product);
    }

    // DELETE PRODUCT
    async remove(
        id: number,
        shopId: number,
    ) {
        const product = await this.findOne(
            id,
            shopId,
        );

        // delete image from imagekit
        if (product.imageFileId) {
            await this.imageKitService.deleteFile(
                product.imageFileId,
            );
        }

        return this.productRepo.remove(product);
    }

    // LOW STOCK PRODUCTS
    async lowStock(shopId: number) {
        return this.productRepo
            .createQueryBuilder("product")
            .where(
                "product.shop_id = :shopId",
                { shopId },
            )
            .andWhere(
                "product.stock <= product.lowStockLimit",
            )
            .getMany();
    }
}
