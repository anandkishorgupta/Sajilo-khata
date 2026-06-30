import { Module } from '@nestjs/common';
import { PosSessionsModule } from '../pos-sessions/pos-sessions.module';
import { ProductsModule } from '../products/products.module';
import { ScanGateway } from './scan.gateway';

@Module({
  imports: [PosSessionsModule, ProductsModule],
  providers: [ScanGateway],
})
export class ScanModule { }