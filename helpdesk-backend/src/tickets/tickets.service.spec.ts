import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TicketsService', () => {
  let service: TicketsService;

  // Creating mock object for prisma
  // simulating the methods that TicketsServices will try to call
  const mockPrismaService = {
    ticket: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'fake-uuid' }),
      update: vi.fn().mockResolvedValue({ id: 'fake-uuid' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
