import { Test, TestingModule } from '@nestjs/testing';

import { HabitLogsController } from './habit-logs.controller';
import { HabitLogsService } from './habit-logs.service';

describe('HabitLogsController', () => {
  let controller: HabitLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitLogsController],
      providers: [HabitLogsService],
    }).compile();

    controller = module.get<HabitLogsController>(HabitLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
