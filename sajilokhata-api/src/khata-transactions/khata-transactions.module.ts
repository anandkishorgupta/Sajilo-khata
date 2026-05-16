import { Module } from '@nestjs/common';
import { KhataTransactionsController } from './khata-transactions.controller';
import { KhataTransactionsService } from './khata-transactions.service';

@Module({
  controllers: [KhataTransactionsController],
  providers: [KhataTransactionsService]
})
export class KhataTransactionsModule {}
