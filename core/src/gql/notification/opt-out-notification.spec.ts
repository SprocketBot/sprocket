import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscordNotificationService } from './discord-notification.service';
import { WebhookNotificationService } from './webhook-notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationTemplateRepository } from '../../db/notification/notification_template.repository';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';
import { UserNotificationPreferenceEntity } from '../../db/notification/user_notification_preference.entity';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import { UserEntity } from '../../db/user/user.entity';

describe('Opt-out Notification System', () => {
    let discordService: DiscordNotificationService;
    let webhookService: WebhookNotificationService;
    let preferenceRepository: jest.Mocked<UserNotificationPreferenceRepository>;
    let historyRepository: jest.Mocked<NotificationHistoryRepository>;
    let templateService: jest.Mocked<NotificationTemplateService>;

    const mockUserId = 'test-user-id';
    const mockWebhookUrl = 'https://discord.com/api/webhooks/123456789/abcdef';
    const mockTemplateName = 'test-template';
    const mockTemplateData = {
        userId: mockUserId,
        message: 'Test notification'
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscordNotificationService,
                WebhookNotificationService,
                {
                    provide: NotificationHistoryRepository,
                    useValue: {
                        create: vi.fn(),
                        save: vi.fn(),
                    },
                },
                {
                    provide: UserNotificationPreferenceRepository,
                    useValue: {
                        findOne: vi.fn(),
                    },
                },
                {
                    provide: NotificationTemplateRepository,
                    useValue: {
                        findOne: vi.fn(),
                    },
                },
                {
                    provide: NotificationTemplateService,
                    useValue: {
                        renderTemplateFromDatabase: vi.fn(),
                    },
                },
            ],
        }).compile();

        discordService = module.get<DiscordNotificationService>(DiscordNotificationService);
        webhookService = module.get<WebhookNotificationService>(WebhookNotificationService);
        preferenceRepository = module.get<UserNotificationPreferenceRepository>(UserNotificationPreferenceRepository) as jest.Mocked<UserNotificationPreferenceRepository>;
        historyRepository = module.get<NotificationHistoryRepository>(NotificationHistoryRepository) as jest.Mocked<NotificationHistoryRepository>;
        templateService = module.get<NotificationTemplateService>(NotificationTemplateService) as jest.Mocked<NotificationTemplateService>;
    });

    describe('shouldSendNotification method', () => {
        it('should return true when no preference exists (opt-out behavior)', async () => {
            preferenceRepository.findOne.mockResolvedValue(null);

            const result = await (discordService as any).shouldSendNotification(mockUserId, NotificationChannel.DISCORD);

            expect(result).toBe(true);
            expect(preferenceRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: mockUserId }, channel: NotificationChannel.DISCORD },
            });
        });

        it('should return true when preference is enabled', async () => {
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.DISCORD,
                enabled: true,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            const result = await (discordService as any).shouldSendNotification(mockUserId, NotificationChannel.DISCORD);

            expect(result).toBe(true);
        });

        it('should return false when preference is disabled', async () => {
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.DISCORD,
                enabled: false,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            const result = await (discordService as any).shouldSendNotification(mockUserId, NotificationChannel.DISCORD);

            expect(result).toBe(false);
        });

        it('should default to true on preference check error', async () => {
            preferenceRepository.findOne.mockRejectedValue(new Error('Database error'));

            const result = await (discordService as any).shouldSendNotification(mockUserId, NotificationChannel.DISCORD);

            expect(result).toBe(true);
        });
    });

    describe('sendNotification with opt-out', () => {
        beforeEach(() => {
            // Mock successful template rendering
            templateService.renderTemplateFromDatabase.mockResolvedValue({
                success: true,
                rendered: JSON.stringify({
                    content: 'Test message',
                    embeds: [],
                }),
            });

            // Mock history repository
            historyRepository.create.mockReturnValue({
                id: 'history-id',
                channel: NotificationChannel.DISCORD,
                recipientId: mockWebhookUrl,
                templateName: mockTemplateName,
                templateData: mockTemplateData,
                status: NotificationStatus.PENDING,
                retryCount: 0,
                createdAt: new Date(),
                updateAt: new Date(),
            } as unknown as NotificationHistoryEntity);

            historyRepository.save.mockResolvedValue({} as unknown as NotificationHistoryEntity);
        });

        it('should skip notification when user has disabled Discord notifications', async () => {
            // Mock user preference as disabled
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.DISCORD,
                enabled: false,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(discordService as any, 'validateWebhookUrl').mockReturnValue(true);

            // Should not throw error, just skip silently
            await expect(
                discordService.sendNotification(mockWebhookUrl, mockTemplateName, mockTemplateData)
            ).resolves.not.toThrow();

            // Verify preference was checked
            expect(preferenceRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: mockUserId }, channel: NotificationChannel.DISCORD },
            });

            // Verify history record was created with skipped status
            expect(historyRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.SENT,
                    errorMessage: 'Notification skipped due to user preferences',
                })
            );
        });

        it('should send notification when user has enabled Discord notifications', async () => {
            // Mock user preference as enabled
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.DISCORD,
                enabled: true,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(discordService as any, 'validateWebhookUrl').mockReturnValue(true);

            // Mock sendWebhookWithRetry to avoid actual HTTP calls
            vi.spyOn(discordService as any, 'sendWebhookWithRetry').mockResolvedValue(undefined);

            await discordService.sendNotification(mockWebhookUrl, mockTemplateName, mockTemplateData);

            // Verify preference was checked
            expect(preferenceRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: mockUserId }, channel: NotificationChannel.DISCORD },
            });

            // Verify history record was created with pending status
            expect(historyRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.PENDING,
                    errorMessage: undefined,
                })
            );
        });

        it('should send notification when no userId is provided in templateData', async () => {
            const templateDataWithoutUser = { message: 'Test notification' };

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(discordService as any, 'validateWebhookUrl').mockReturnValue(true);

            // Mock sendWebhookWithRetry to avoid actual HTTP calls
            vi.spyOn(discordService as any, 'sendWebhookWithRetry').mockResolvedValue(undefined);

            await discordService.sendNotification(mockWebhookUrl, mockTemplateName, templateDataWithoutUser);

            // Verify preference was NOT checked (no userId)
            expect(preferenceRepository.findOne).not.toHaveBeenCalled();

            // Verify history record was created without user
            expect(historyRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: undefined,
                })
            );
        });

        it('should send notification when no preference exists (opt-out default)', async () => {
            // Mock no preference found
            preferenceRepository.findOne.mockResolvedValue(null);

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(discordService as any, 'validateWebhookUrl').mockReturnValue(true);

            // Mock sendWebhookWithRetry to avoid actual HTTP calls
            vi.spyOn(discordService as any, 'sendWebhookWithRetry').mockResolvedValue(undefined);

            await discordService.sendNotification(mockWebhookUrl, mockTemplateName, mockTemplateData);

            // Verify preference was checked
            expect(preferenceRepository.findOne).toHaveBeenCalled();

            // Verify notification was sent (no skip)
            expect(historyRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.PENDING,
                })
            );
        });
    });

    describe('WebhookNotificationService opt-out', () => {
        beforeEach(() => {
            // Mock successful template rendering
            templateService.renderTemplateFromDatabase.mockResolvedValue({
                success: true,
                rendered: JSON.stringify({
                    message: 'Test webhook message',
                }),
            });

            // Mock history repository
            historyRepository.create.mockReturnValue({
                id: 'history-id',
                channel: NotificationChannel.WEBHOOK,
                recipientId: mockWebhookUrl,
                templateName: mockTemplateName,
                templateData: mockTemplateData,
                status: NotificationStatus.PENDING,
                retryCount: 0,
                createdAt: new Date(),
                updateAt: new Date(),
            } as unknown as NotificationHistoryEntity);

            historyRepository.save.mockResolvedValue({} as unknown as NotificationHistoryEntity);
        });

        it('should skip webhook notification when user has disabled webhook notifications', async () => {
            // Mock user preference as disabled
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.WEBHOOK,
                enabled: false,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(webhookService as any, 'validateWebhookUrl').mockReturnValue(true);

            const result = await webhookService.sendNotification(mockWebhookUrl, mockTemplateName, mockTemplateData);

            // Should return success response with skip indication
            expect(result.status).toBe(200);
            expect(result.data).toEqual({ skipped: true, reason: 'user_preferences' });

            // Verify preference was checked
            expect(preferenceRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: mockUserId }, channel: NotificationChannel.WEBHOOK },
            });
        });

        it('should send webhook notification when user has enabled webhook notifications', async () => {
            // Mock user preference as enabled
            const mockPreference: UserNotificationPreferenceEntity = {
                id: 'pref-id',
                user: { id: mockUserId } as UserEntity,
                channel: NotificationChannel.WEBHOOK,
                enabled: true,
                settings: {},
                createdAt: new Date(),
                updateAt: new Date(),
            } as UserNotificationPreferenceEntity;
            preferenceRepository.findOne.mockResolvedValue(mockPreference);

            // Mock the validateWebhookUrl method to return true
            vi.spyOn(webhookService as any, 'validateWebhookUrl').mockReturnValue(true);

            // Mock sendWebhookWithRetry to avoid actual HTTP calls
            vi.spyOn(webhookService as any, 'sendWebhookWithRetry').mockResolvedValue({
                status: 200,
                statusText: 'OK',
                headers: {},
                data: { success: true },
            });

            const result = await webhookService.sendNotification(mockWebhookUrl, mockTemplateName, mockTemplateData);

            // Should return actual webhook response
            expect(result.status).toBe(200);
            expect(result.data).toEqual({ success: true });

            // Verify preference was checked
            expect(preferenceRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: mockUserId }, channel: NotificationChannel.WEBHOOK },
            });
        });
    });
});