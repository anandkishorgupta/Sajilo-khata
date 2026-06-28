// src/scan/scan.module.ts
import { Module } from '@nestjs/common';
import { ScanGateway } from './scan.gateway';
import { PosSessionsModule } from '../pos-sessions/pos-sessions.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PosSessionsModule, ProductsModule],
  providers: [ScanGateway],
})
export class ScanModule {}