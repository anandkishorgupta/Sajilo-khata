import { Test, TestingModule } from '@nestjs/testing';
import { ScanGateway } from './scan.gateway';

describe('ScanGateway', () => {
  let gateway: ScanGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanGateway],
    }).compile();

    gateway = module.get<ScanGateway>(ScanGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
