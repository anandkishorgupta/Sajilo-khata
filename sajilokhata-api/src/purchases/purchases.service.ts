import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Product } from "../products/entities";
import { Shop } from "../shops/entities";
import { Purchase, PurchaseItem } from "./entities";
import { StockMovement } from "../stock-movements/entities";
import { CreatePurchaseDto } from "./dto";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Shop)
    private shopRepo: Repository<Shop>,

    @InjectRepository(PurchaseItem)
    private purchaseItemRepo: Repository<PurchaseItem>,

    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
  ) {}

  // =========================
  // CREATE PURCHASE
  // =========================
  async create(dto: CreatePurchaseDto, shopId: number, userId: number) {
    const shop = await this.shopRepo.findOne({
      where: { id: shopId },
    });

    if (!shop) throw new NotFoundException("Shop not found");

    let subtotal = 0;
    const items: PurchaseItem[] = [];

    for (const item of dto.items) {
      const product = await this.productRepo.findOne({
        where: {
          id: item.productId,
          shop: { id: shopId },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const itemTotal = item.unitPrice * item.quantity;
      subtotal += itemTotal;

      const purchaseItem = this.purchaseItemRepo.create({
        product: { id: product.id },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemTotal,
      });

      items.push(purchaseItem);

      // stock increase
      product.stock += item.quantity;
      product.purchasePrice = item.unitPrice;
      await this.productRepo.save(product);

      await this.stockMovementRepo.save({
        shop: { id: shopId },
        product: { id: product.id },
        type: "in",
        quantity: item.quantity,
      });
    }

    const discount = dto.discount ?? 0;
    const tax = dto.tax ?? 0;

    const totalAmount = subtotal - discount + tax;
    const paidAmount = dto.paidAmount ?? totalAmount;
    const dueAmount = totalAmount - paidAmount;

    const paymentStatus =
      dueAmount <= 0 ? "paid" : paidAmount > 0 ? "partial" : "due";

    const invoiceNumber = `PUR-${Date.now()}`;

    // ✅ IMPORTANT FIX: safe entity creation
    const purchase = this.purchaseRepo.create({
      shop: { id: shopId } as Shop,
      user: { id: userId } as any,

      invoiceNumber,
      totalAmount,
      paidAmount,
      dueAmount,

      paymentMethod: dto.paymentMethod,
      paymentStatus,

      supplierName: dto.supplierName,
      items,
    });

    return await this.purchaseRepo.save(purchase);
  }

  // =========================
  // GET ALL
  // =========================
  async findAll(shopId: number) {
    return this.purchaseRepo.find({
      where: { shop: { id: shopId } },
      relations: {
        items: { product: true },
      },
      order: { createdAt: "DESC" },
    });
  }

  // =========================
  // GET ONE
  // =========================
  async findOne(id: number, shopId: number) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id, shop: { id: shopId } },
      relations: {
        items: { product: true },
      },
    });

    if (!purchase) throw new NotFoundException("Purchase not found");

    return purchase;
  }

  // =========================
  // DELETE (REVERSE STOCK)
  // =========================
  async remove(id: number, shopId: number) {
    const purchase = await this.findOne(id, shopId);

    for (const item of purchase.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.product.id },
      });

      if (!product) continue;

      product.stock -= item.quantity;
      await this.productRepo.save(product);

      await this.stockMovementRepo.save({
        shop: { id: shopId },
        product: { id: product.id },
        type: "out",
        quantity: item.quantity,
      });
    }

    return this.purchaseRepo.remove(purchase);
  }
}