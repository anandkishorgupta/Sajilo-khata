import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
@Roles('owner')
export class StaffController {
    constructor(private readonly staffService: StaffService) {}

    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateStaffDto) {
        return this.staffService.createStaff(user.shopId, dto);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.staffService.getStaffMembers(user.shopId);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
        return this.staffService.getStaffMember(user.shopId, id);
    }

    @Delete(':id')
    remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
        return this.staffService.removeStaff(user.shopId, id);
    }
}
