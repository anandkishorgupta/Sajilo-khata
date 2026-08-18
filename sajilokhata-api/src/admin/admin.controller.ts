import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipSubscription } from '../auth/decorators/skip-subscription.decorator';

@Controller('admin')
@SkipSubscription()
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('auth/login')
    @Public()
    login(@Body() dto: AdminLoginDto) {
        return this.adminService.login(dto);
    }

    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    @Get('shops')
    getShops(
        @Query('search') search?: string,
        @Query('plan') plan?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getShops({
            search,
            plan,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }

    @Get('shops/:id')
    getShopDetail(@Param('id') id: string) {
        return this.adminService.getShopDetail(Number(id));
    }

    @Patch('shops/:id/extend')
    extendShop(
        @Param('id') id: string,
        @Body() body: { durationDays: number; plan?: string },
    ) {
        return this.adminService.extendShop(Number(id), body.durationDays, body.plan);
    }

    @Get('users')
    getUsers(
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getUsers({
            search,
            role,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }

    @Get('payments')
    getPayments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.adminService.getPayments({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            status,
        });
    }
}
