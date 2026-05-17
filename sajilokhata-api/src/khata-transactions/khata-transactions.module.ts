import { Module } from '@nestjs/common';
import { KhataTransactionsController } from './khata-transactions.controller';
import { KhataTransactionsService } from './khata-transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhataTransaction } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([KhataTransaction])], // Add any necessary imports here
  controllers: [KhataTransactionsController],
  providers: [KhataTransactionsService]
})
export class KhataTransactionsModule {}
