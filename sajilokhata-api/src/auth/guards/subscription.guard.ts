import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../shops/entities';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Shop)
    private shopRepo: Repository<Shop>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const user = context.switchToHttp().getRequest().user;
    if (!user || !user.shopId) return false;

    const shop = await this.shopRepo.findOne({ where: { id: user.shopId } });
    if (!shop) return false;

    if (shop.status === 'active') return true;

    if (shop.trialEndsAt < new Date()) {
      shop.status = 'expired';
      await this.shopRepo.save(shop);
      throw new ForbiddenException('TRIAL_EXPIRED');
    }

    return true; // status is 'trial' and trialEndsAt is in the future
  }
}