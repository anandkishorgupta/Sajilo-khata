import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto, UpdateProfileDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    getProfile(@CurrentUser() user: any) {
        return this.usersService.getProfile(user.userId);
    }

    @Patch('profile')
    updateProfile(
        @CurrentUser() user: any,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.userId, dto);
    }

    @Patch('change-password')
    changePassword(
        @CurrentUser() user: any,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(user.userId, dto);
    }
}
