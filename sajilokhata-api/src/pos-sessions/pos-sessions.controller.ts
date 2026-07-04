// src/pos-sessions/pos-sessions.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PosSessionsService } from './pos-sessions.service';

@Controller('pos-sessions')
export class PosSessionsController {
  constructor(private readonly service: PosSessionsService) { }

  // Laptop calls this to create a session
  // this is just creating a random string as session string and saving to db .
  @Post()
  async create(@CurrentUser() user: any) {
    const shopId = user.shopId;
    const session = await this.service.createSession(shopId);
    return {
      sessionCode: session.sessionCode,
    };
  }

  // Returns session info (phone can verify before connecting)
  @Get(':code')
  async getSession(@Param('code') code: string) {
    const session = await this.service.findByCode(code);
    if (!session) return { valid: false };
    return { valid: true, shopId: session.shopId };
  }
}