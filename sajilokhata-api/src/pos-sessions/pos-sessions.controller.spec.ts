import { Test, TestingModule } from '@nestjs/testing';
import { PosSessionsController } from './pos-sessions.controller';

describe('PosSessionsController', () => {
  let controller: PosSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosSessionsController],
    }).compile();

    controller = module.get<PosSessionsController>(PosSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
