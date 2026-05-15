import { Test, TestingModule } from '@nestjs/testing';
import { KhataController } from './khata.controller';

describe('KhataController', () => {
  let controller: KhataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KhataController],
    }).compile();

    controller = module.get<KhataController>(KhataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
