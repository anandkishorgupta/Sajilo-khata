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
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    const session = this.repo.create({
      sessionCode: generateCode(),
      shopId,
      status: 'active',
      expiresAt,
    });
    return this.repo.save(session);
  }

  async findActiveByCode(sessionCode: string): Promise<PosSession | null> {
    return this.repo.findOne({
      where: {
        sessionCode,
        status: 'active',
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async setLaptopSocket(sessionCode: string, socketId: string | null) {
    await this.repo.update({ sessionCode }, { laptopSocketId: socketId });
  }

  async setLastProduct(sessionCode: string, productId: number | null) {
    await this.repo.update({ sessionCode }, { lastScannedProductId: productId });
  }

  async getLastProduct(sessionCode: string): Promise<number | null> {
    const s = await this.repo.findOne({ where: { sessionCode } });
    return s?.lastScannedProductId ?? null;
  }

  @Cron('0 * * * *') // every hour
  async expireSessions() {
    await this.repo.update(
      { status: 'active', expiresAt: MoreThan(new Date()) },
      { status: 'expired' },
    );
  }
}