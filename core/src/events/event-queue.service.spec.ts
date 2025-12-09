import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventQueueService } from './event-queue.service';
import { EventQueue, EventStatus, EventTarget, EventType } from '../db/events/event_queue.entity';

const mockEventQueueRepository = () => ({
    create: vi.fn(),
    save: vi.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, ReturnType<typeof vi.fn>>>;

describe('EventQueueService', () => {
    let service: EventQueueService;
    let repository: MockRepository<EventQueue>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventQueueService,
                {
                    provide: getRepositoryToken(EventQueue),
                    useFactory: mockEventQueueRepository,
                },
            ],
        }).compile();

        service = module.get<EventQueueService>(EventQueueService);
        repository = module.get<MockRepository<EventQueue>>(getRepositoryToken(EventQueue));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('publish', () => {
        it('should create and save an event', async () => {
            const topic = EventTarget.REPLAY_PARSE;
            const type = EventType.SUBMISSION_CREATED;
            const payload = { submissionId: '123' };
            const expectedEvent = {
                targetService: topic,
                eventType: type,
                payload: payload,
                status: EventStatus.PENDING,
            };

            repository.create.mockReturnValue(expectedEvent);
            repository.save.mockResolvedValue({ id: 'uuid', ...expectedEvent });

            const result = await service.publish(topic, type, payload);

            expect(repository.create).toHaveBeenCalledWith(expectedEvent);
            expect(repository.save).toHaveBeenCalledWith(expectedEvent);
            expect(result).toEqual({ id: 'uuid', ...expectedEvent });
        });
    });
});