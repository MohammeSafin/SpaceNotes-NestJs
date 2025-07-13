import { Test, TestingModule } from '@nestjs/testing';
import { SummarizerController } from './summarizer.controller';

describe('SummarizerController', () => {
  let controller: SummarizerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummarizerController],
    }).compile();

    controller = module.get<SummarizerController>(SummarizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
