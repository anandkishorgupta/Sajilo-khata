import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto, shopId: number) {
    const category = this.categoryRepo.create({
      ...dto,
      shop: { id: shopId },
    });
    return this.categoryRepo.save(category);
  }

  async findAll(shopId: number) {
    return this.categoryRepo.find({
      where: { shop: { id: shopId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, shopId: number) {
    const category = await this.categoryRepo.findOne({
      where: { id, shop: { id: shopId } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto, shopId: number) {
    const category = await this.findOne(id, shopId);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number, shopId: number) {
    const category = await this.findOne(id, shopId);
    return this.categoryRepo.remove(category);
  }
}
