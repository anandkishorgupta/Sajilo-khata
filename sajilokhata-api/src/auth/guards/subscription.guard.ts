import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    // Public routes
    if (!user) {
      return true;
    }

    const shop = user.shop;

    if (!shop) {
      return true;
    }

    const now = new Date();

    if (
      shop.status === 'trial' &&
      shop.trialEndsAt &&
      new Date(shop.trialEndsAt) < now
    ) {
      throw new ForbiddenException(
        'Your trial has expired. Please upgrade your membership.',
      );
    }

    if (
      shop.status === 'active' &&
      shop.subscriptionEnd &&
      new Date(shop.subscriptionEnd) < now
    ) {
      throw new ForbiddenException(
        'Your membership has expired. Please renew your subscription.',
      );
    }

    if (shop.status === 'expired') {
      throw new ForbiddenException(
        'Your membership has expired.',
      );
    }

    return true;
  }
}