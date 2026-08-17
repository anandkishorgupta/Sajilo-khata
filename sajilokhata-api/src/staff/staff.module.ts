import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [StaffController],
    providers: [StaffService],
})
export class StaffModule {}
