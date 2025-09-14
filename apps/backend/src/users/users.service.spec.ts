import { Test, TestingModule } from '@nestjs/testing';

import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockDb = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
