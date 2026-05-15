import { Module } from '@nestjs/common';
import { KhataService } from './khata.service';
import { KhataController } from './khata.controller';

@Module({
  providers: [KhataService],
  controllers: [KhataController]
})
export class KhataModule {}
