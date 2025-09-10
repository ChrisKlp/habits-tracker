import { Test, TestingModule } from '@nestjs/testing';
import { HabitLogsService } from './habit-logs.service';

describe('HabitLogsService', () => {
  let service: HabitLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitLogsService],
    }).compile();

    service = module.get<HabitLogsService>(HabitLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
