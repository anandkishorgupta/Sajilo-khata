// src/pos-sessions/pos-sessions.controller.ts
import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PosSessionsService } from './pos-sessions.service';

@Controller('pos-sessions')
export class PosSessionsController {
  constructor(private readonly service: PosSessionsService) {}

  // Laptop calls this to create a session
  @Post()
  async create(@Req() req) {
    const { shopId } = req.user;
    const session = await this.service.createSession(shopId);
    return {
      sessionCode: session.sessionCode,
      expiresAt: session.expiresAt,
    };
  }

  // Returns session info (phone can verify before connecting)
  @Get(':code')
  async getSession(@Param('code') code: string) {
    const session = await this.service.findActiveByCode(code);
    if (!session) return { valid: false };
    return { valid: true, shopId: session.shopId };
  }
}