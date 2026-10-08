import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller.js';
import { TicketsService } from './tickets.service.js';

describe('TicketsController', () => {
  let controller: TicketsController;

  const mockTicketsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
