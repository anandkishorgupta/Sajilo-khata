import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async createStaff(shopId: number, dto: CreateStaffDto) {
        const existing = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const staff = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: 'staff',
            shop: { id: shopId } as any,
        });

        const saved = await this.userRepo.save(staff);
        const { password, ...result } = saved;
        return result;
    }

    async getStaffMembers(shopId: number) {
        const staff = await this.userRepo.find({
            where: { shop: { id: shopId }, role: 'staff' },
            order: { createdAt: 'DESC' },
        });
        return staff.map(({ password, ...rest }) => rest);
    }

    async getStaffMember(shopId: number, staffId: number) {
        const member = await this.userRepo.findOne({
            where: { id: staffId, shop: { id: shopId }, role: 'staff' },
        });
        if (!member) throw new NotFoundException('Staff member not found');
        const { password, ...result } = member;
        return result;
    }

    async removeStaff(shopId: number, staffId: number) {
        const member = await this.userRepo.findOne({
            where: { id: staffId, shop: { id: shopId }, role: 'staff' },
        });
        if (!member) throw new NotFoundException('Staff member not found');
        await this.userRepo.remove(member);
        return { message: 'Staff member removed' };
    }
}
