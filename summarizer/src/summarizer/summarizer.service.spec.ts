import { Test, TestingModule } from '@nestjs/testing';
import { SummarizerService } from './summarizer.service';

describe('SummarizerService', () => {
  let service: SummarizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummarizerService],
    }).compile();

    service = module.get<SummarizerService>(SummarizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
