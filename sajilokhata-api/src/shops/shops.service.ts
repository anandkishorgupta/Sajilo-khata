import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities';
import { UpdateShopDto } from './dto';

@Injectable()
export class ShopsService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) {}

    async updateShop(shopId: number, dto: UpdateShopDto) {
        const shop = await this.shopRepository.findOne({
            where: { id: shopId },
        });
        if (!shop) throw new NotFoundException('Shop not found');

        Object.assign(shop, dto);
        return this.shopRepository.save(shop);
    }
}
