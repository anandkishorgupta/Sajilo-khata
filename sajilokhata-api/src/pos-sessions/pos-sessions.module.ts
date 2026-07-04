// src/pos-sessions/pos-sessions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosSessionsService } from './pos-sessions.service';
import { PosSessionsController } from './pos-sessions.controller';
import { PosSession } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([PosSession])],
  providers: [PosSessionsService],
  controllers: [PosSessionsController],
  exports: [PosSessionsService],
})
export class PosSessionsModule {}