import { Test, TestingModule } from '@nestjs/testing';

import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';

import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  let service: HabitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
