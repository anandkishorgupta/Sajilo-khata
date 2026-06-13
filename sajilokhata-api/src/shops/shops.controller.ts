import { Body, Controller, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateShopDto } from './dto';
import { ShopsService } from './shops.service';

@Controller('shops')
// @UseGuards(JwtAuthGuard)
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Patch()
    updateShop(
        @CurrentUser() user: any,
        @Body() dto: UpdateShopDto,
    ) {
        return this.shopsService.updateShop(user.shopId, dto);
    }
}
