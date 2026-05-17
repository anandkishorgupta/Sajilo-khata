import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { StockMovement } from "./entities";
import { GetStockMovementsDto } from "./dto";

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockRepo: Repository<StockMovement>,
  ) {}

  // =========================
  // GET REPORT
  // =========================
  async findAll(shopId: number, query: GetStockMovementsDto) {
    const qb = this.stockRepo
      .createQueryBuilder("sm")
      .leftJoinAndSelect("sm.product", "product")
      .leftJoinAndSelect("sm.shop", "shop")
      .where("shop.id = :shopId", { shopId });

    if (query.type) {
      qb.andWhere("sm.type = :type", { type: query.type });
    }

    if (query.productId) {
      qb.andWhere("product.id = :productId", {
        productId: query.productId,
      });
    }

    return qb.orderBy("sm.createdAt", "DESC").getMany();
  }
}