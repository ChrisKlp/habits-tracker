import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';

describe('AuthService', () => {
  let service: AuthService;

  const mockDb = {};
  const mockTokenService = {
    createJwtToken: jest.fn(),
  };
  const mockSessionService = {
    addSession: jest.fn(),
    validateSession: jest.fn(),
    removeSession: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };
  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
