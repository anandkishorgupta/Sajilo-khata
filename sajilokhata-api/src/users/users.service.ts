import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string) {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    async create(data: Partial<User>) {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async getProfile(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['shop'],
        });
        if (!user) throw new NotFoundException('User not found');

        const { password, ...result } = user;
        return result;
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['shop'],
        });
        if (!user) throw new NotFoundException('User not found');

        if (dto.email && dto.email !== user.email) {
            const existing = await this.findByEmail(dto.email);
            if (existing) throw new BadRequestException('Email already in use');
        }

        Object.assign(user, dto);
        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return result;
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new BadRequestException('Current password is incorrect');

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }
}
