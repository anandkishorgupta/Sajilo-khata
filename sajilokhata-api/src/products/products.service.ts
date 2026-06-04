
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageKitService } from '../imagekit/imagekit.service';
import { Shop } from '../shops/entities';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Product } from './entities';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Shop)
    private shopRepo: Repository<Shop>,
    private imageKitService: ImageKitService,
  ) { }

  async create(dto: CreateProductDto, shopId: number, file?: Express.Multer.File) {
    let imageData: { url?: string; fileId?: string } = {};
    if (file) {
      imageData = await this.imageKitService.upload(file);
    }
    const product = this.productRepo.create({
      ...dto,
      shop: { id: shopId },
      imageUrl: imageData.url,
      imageFileId: imageData.fileId,
    });
    return this.productRepo.save(product);
  }
  async findAll(
    shopId: number,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      stockFilter?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    },
  ) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const qb = this.productRepo
      .createQueryBuilder("product")
      .where("product.shop_id = :shopId", {
        shopId,
      });

    // Search
    if (filters.search) {
      qb.andWhere(
        `
      (
        LOWER(product.name) LIKE LOWER(:search)
        OR LOWER(product.sku) LIKE LOWER(:search)
      )
    `,
        {
          search: `%${filters.search}%`,
        },
      );
    }

    // Category
    if (filters.category) {
      qb.andWhere(
        "product.category = :category",
        {
          category: filters.category,
        },
      );
    }

    // Stock Filter
    if (filters.stockFilter === "low") {
      qb.andWhere(
        "product.stock <= product.lowStockLimit AND product.stock > 0",
      );
    }

    if (filters.stockFilter === "out") {
      qb.andWhere(
        "product.stock = 0",
      );
    }

    // Sorting
    const allowedSortFields = [
      "name",
      "purchasePrice",
      "sellingPrice",
      "stock",
      "createdAt",
    ];

    const sortBy = allowedSortFields.includes(
      filters.sortBy || "",
    )
      ? filters.sortBy
      : "createdAt";

    const sortOrder =
      filters.sortOrder === "ASC"
        ? "ASC"
        : "DESC";

    qb.orderBy(
      `product.${sortBy}`,
      sortOrder,
    );

    // Pagination
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [products, total] =
      await qb.getManyAndCount();

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }


  // get stats
  async getStats(shopId: number) {
    const products = await this.productRepo.find({
      where: { shop: { id: shopId } },
    });

    const total = products.length;
    const lowStock = products.filter((p) => p.stock <= p.lowStockLimit).length;
    const categories = new Set(products.map((p) => p.category)).size;
    const stockValue = products.reduce(
      (sum, p) => sum + Number(p.purchasePrice) * p.stock,
      0,
    );

    return { total, lowStock, expiringSoon: 0, categories, stockValue };
  }

  async findOne(id: number, shopId: number) {
    const product = await this.productRepo.findOne({
      where: { id, shop: { id: shopId } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto, shopId: number, file?: Express.Multer.File) {
    console.log('Updating product with id:', id, 'and data:', dto, 'and file:', file);
    const product = await this.findOne(id, shopId);

    if (file) {
      if (product.imageFileId) {
        await this.imageKitService.deleteFile(product.imageFileId);
      }
      const imageData = await this.imageKitService.upload(file);
      product.imageUrl = imageData.url;
      product.imageFileId = imageData.fileId;
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number, shopId: number) {
    const product = await this.findOne(id, shopId);
    if (product.imageFileId) {
      await this.imageKitService.deleteFile(product.imageFileId);
    }
    return this.productRepo.remove(product);
  }

  async lowStock(shopId: number) {
    return this.productRepo
      .createQueryBuilder('product')
      .where('product.shop_id = :shopId', { shopId })
      .andWhere('product.stock <= product.lowStockLimit')
      .getMany();
  }
}