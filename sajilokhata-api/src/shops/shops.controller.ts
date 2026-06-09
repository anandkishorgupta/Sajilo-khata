import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ShopsService } from './shops.service';
import { UpdateShopDto } from './dto';

@Controller('shops')
@UseGuards(JwtAuthGuard)
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) {}

    @Patch()
    updateShop(
        @CurrentUser() user: any,
        @Body() dto: UpdateShopDto,
    ) {
        return this.shopsService.updateShop(user.shopId, dto);
    }
}
