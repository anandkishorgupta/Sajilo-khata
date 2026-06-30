// src/pos-sessions/pos-sessions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PosSession } from './entities';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class PosSessionsService {
  constructor(
    @InjectRepository(PosSession)
    private readonly repo: Repository<PosSession>,
  ) {}

  async createSession(shopId: number): Promise<PosSession> {
    const session = this.repo.create({
      sessionCode: generateCode(),
      shopId,
    });
    return this.repo.save(session);
  }

  async findByCode(sessionCode: string): Promise<PosSession | null> {
    return this.repo.findOne({
      where: {
        sessionCode,
      },
    });
  }

  async setLaptopSocket(sessionCode: string, socketId: string | null) {
    await this.repo.update({ sessionCode }, { laptopSocketId: socketId });
  }


}