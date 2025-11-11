import { Test, TestingModule } from '@nestjs/testing';
import { DiscordNotificationService, DiscordWebhookPayload, DiscordEmbed } from './discord-notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('DiscordNotificationService', () => {
    let service: DiscordNotificationService;
    let mockTemplateService: Partial<NotificationTemplateService>;
    let mockHistoryRepository: Partial<NotificationHistoryRepository>;
    let mockPreferenceRepository: Partial<UserNotificationPreferenceRepository>;
    let axiosMock: MockAdapter;

    const validWebhookUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz';
    const invalidWebhookUrl = 'https://example.com/invalid-webhook';

    beforeEach(async () => {
        // Mock axios
        axiosMock = new MockAdapter(axios);

        // Mock services
        mockTemplateService = {
            renderTemplateFromDatabase: jest.fn(),
        };

        mockHistoryRepository = {
            create: jest.fn(),
            save: jest.fn(),
        };

        mockPreferenceRepository = {
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscordNotificationService,
                {
                    provide: NotificationTemplateService,
                    useValue: mockTemplateService,
                },
                {
                    provide: NotificationHistoryRepository,
                    useValue: mockHistoryRepository,
                },
                {
                    provide: UserNotificationPreferenceRepository,
                    useValue: mockPreferenceRepository,
                },
            ],
        }).compile();

        service = module.get<DiscordNotificationService>(DiscordNotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        axiosMock.reset();
        service.clearRateLimitCache();
    });

    describe('validateWebhookUrl', () => {
        it('should validate correct Discord webhook URLs', () => {
            const validUrls = [
                'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
                'https://discordapp.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
                'https://discord.com/api/webhooks/123456789/abc-123_xyz',
            ];

            validUrls.forEach(url => {
                expect(service['validateWebhookUrl'](url)).toBe(true);
            });
        });

        it('should reject invalid webhook URLs', () => {
            const invalidUrls = [
                'https://example.com/webhook',
                'https://discord.com/api/webhooks/123', // Missing token
                'not-a-url',
                '',
                'https://discord.com/api/webhooks/abc/123', // Non-numeric ID
            ];

            invalidUrls.forEach(url => {
                expect(service['validateWebhookUrl'](url)).toBe(false);
            });
        });
    });

    describe('getWebhookId', () => {
        it('should extract webhook ID from valid URL', () => {
            const url = 'https://discord.com/api/webhooks/123456789/abc';
            expect(service['getWebhookId'](url)).toBe('123456789');
        });

        it('should return unknown for invalid URLs', () => {
            expect(service['getWebhookId']('invalid-url')).toBe('unknown');
            expect(service['getWebhookId']('')).toBe('unknown');
        });
    });

    describe('sendSimpleMessage', () => {
        it('should send simple text message successfully', async () => {
            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendSimpleMessage(validWebhookUrl, 'Hello, Discord!');

            expect(axiosMock.history.post.length).toBe(1);
            expect(axiosMock.history.post[0].url).toBe(validWebhookUrl);
            expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
                content: 'Hello, Discord!',
            });
        });

        it('should send message with custom username and avatar', async () => {
            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendSimpleMessage(validWebhookUrl, 'Test message', {
                username: 'TestBot',
                avatarUrl: 'https://example.com/avatar.png',
            });

            const payload = JSON.parse(axiosMock.history.post[0].data);
            expect(payload).toEqual({
                content: 'Test message',
                username: 'TestBot',
                avatar_url: 'https://example.com/avatar.png',
            });
        });

        it('should throw error for invalid webhook URL', async () => {
            await expect(
                service.sendSimpleMessage(invalidWebhookUrl, 'Test message')
            ).rejects.toThrow('Invalid Discord webhook URL');
        });

        it('should retry on failure', async () => {
            axiosMock.onPost(validWebhookUrl).reply(500).onPost(validWebhookUrl).reply(204);

            await service.sendSimpleMessage(validWebhookUrl, 'Test message');

            expect(axiosMock.history.post.length).toBe(2);
        });

        it('should fail after max retries', async () => {
            axiosMock.onPost(validWebhookUrl).reply(500);

            await expect(
                service.sendSimpleMessage(validWebhookUrl, 'Test message')
            ).rejects.toThrow();

            expect(axiosMock.history.post.length).toBe(4); // Initial + 3 retries
        });
    });

    describe('sendNotification', () => {
        const mockTemplateData = { scrimId: '123', gameMode: '3v3' };
        const mockRenderedTemplate = JSON.stringify({
            content: 'Scrim completed!',
            embeds: [{
                title: 'Scrim #123',
                description: 'Game Mode: 3v3',
                color: 0x00ff00,
            }],
        });

        beforeEach(() => {
            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedTemplate,
            });

            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-123',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'scrim_completed',
                templateData: mockTemplateData,
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });

            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));
        });

        it('should send notification with rendered template', async () => {
            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(mockTemplateService.renderTemplateFromDatabase).toHaveBeenCalledWith('scrim_completed', mockTemplateData);
            expect(axiosMock.history.post.length).toBe(1);

            const payload = JSON.parse(axiosMock.history.post[0].data);
            expect(payload.content).toBe('Scrim completed!');
            expect(payload.embeds).toHaveLength(1);
            expect(payload.embeds[0].title).toBe('Scrim #123');
        });

        it('should apply username and avatar overrides', async () => {
            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData, {
                username: 'SprocketBot',
                avatarUrl: 'https://example.com/bot-avatar.png',
            });

            const payload = JSON.parse(axiosMock.history.post[0].data);
            expect(payload.username).toBe('SprocketBot');
            expect(payload.avatar_url).toBe('https://example.com/bot-avatar.png');
        });

        it('should throw error for invalid webhook URL', async () => {
            await expect(
                service.sendNotification(invalidWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow('Invalid Discord webhook URL');

            expect(mockHistoryRepository.create).toHaveBeenCalled();
            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Invalid Discord webhook URL'),
                })
            );
        });

        it('should handle template rendering failure', async () => {
            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: false,
                error: 'Template not found',
            });

            await expect(
                service.sendNotification(validWebhookUrl, 'nonexistent_template', mockTemplateData)
            ).rejects.toThrow('Template rendering failed');

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Template rendering failed'),
                })
            );
        });

        it('should handle invalid JSON in rendered template', async () => {
            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: 'invalid json {{{',
            });

            await expect(
                service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow('Invalid JSON in rendered template');

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Invalid JSON in rendered template'),
                })
            );
        });

        it('should validate payload has content or embeds', async () => {
            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: JSON.stringify({}), // Empty payload
            });

            await expect(
                service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow('Discord payload must contain either content or embeds');

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Discord payload must contain either content or embeds'),
                })
            );
        });

        it('should create and update history record on success', async () => {
            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(mockHistoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: NotificationChannel.DISCORD,
                    recipientId: validWebhookUrl,
                    templateName: 'scrim_completed',
                    status: NotificationStatus.PENDING,
                })
            );

            expect(mockHistoryRepository.save).toHaveBeenCalledTimes(2); // Once for pending, once for sent
            expect(mockHistoryRepository.save).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.SENT,
                    sentAt: expect.any(Date),
                })
            );
        });

        it('should handle webhook errors and update history', async () => {
            axiosMock.onPost(validWebhookUrl).reply(500);

            await expect(
                service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow();

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.any(String),
                })
            );
        });
    });

    describe('Rate limiting', () => {
        it('should respect rate limit headers', async () => {
            const rateLimitHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': (Date.now() / 1000 + 1).toString(), // Reset in 1 second
            };

            axiosMock.onPost(validWebhookUrl).reply(204, {}, rateLimitHeaders);

            const startTime = Date.now();
            await service.sendSimpleMessage(validWebhookUrl, 'Test');
            const endTime = Date.now();

            // Should have waited for rate limit reset
            expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
        });

        it('should handle retry-after header', async () => {
            const retryAfterHeaders = {
                'retry-after': '2', // 2 seconds
            };

            axiosMock.onPost(validWebhookUrl).reply(429, {}, retryAfterHeaders);

            const startTime = Date.now();
            try {
                await service.sendSimpleMessage(validWebhookUrl, 'Test');
            } catch (error) {
                // Expected to fail after retries
            }
            const endTime = Date.now();

            // Should have waited for retry-after
            expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
        });

        it('should queue requests when rate limited', async () => {
            // First request sets rate limit to 0 remaining
            const rateLimitHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': (Date.now() / 1000 + 2).toString(),
            };

            axiosMock.onPost(validWebhookUrl).reply(204, {}, rateLimitHeaders);

            // Send first request to trigger rate limiting
            await service.sendSimpleMessage(validWebhookUrl, 'First message');

            // Queue should be processed after rate limit reset
            expect(service.getQueueSize(validWebhookUrl)).toBe(0);

            // Mock reset for next request
            const resetHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '5',
                'x-ratelimit-reset': (Date.now() / 1000 + 10).toString(),
            };

            axiosMock.onPost(validWebhookUrl).reply(204, {}, resetHeaders);

            // This should not throw and should be processed
            await expect(
                service.sendSimpleMessage(validWebhookUrl, 'Second message')
            ).resolves.not.toThrow();
        });

        it('should get rate limit info', async () => {
            const rateLimitHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '3',
                'x-ratelimit-reset': (Date.now() / 1000 + 60).toString(),
            };

            axiosMock.onPost(validWebhookUrl).reply(204, {}, rateLimitHeaders);

            await service.sendSimpleMessage(validWebhookUrl, 'Test');

            const rateLimitInfo = service.getRateLimitInfo(validWebhookUrl);
            expect(rateLimitInfo).toBeDefined();
            expect(rateLimitInfo?.limit).toBe(5);
            expect(rateLimitInfo?.remaining).toBe(3);
        });

        it('should clear rate limit cache', async () => {
            const rateLimitHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '3',
                'x-ratelimit-reset': (Date.now() / 1000 + 60).toString(),
            };

            axiosMock.onPost(validWebhookUrl).reply(204, {}, rateLimitHeaders);

            await service.sendSimpleMessage(validWebhookUrl, 'Test');

            expect(service.getRateLimitInfo(validWebhookUrl)).toBeDefined();

            service.clearRateLimitCache();

            expect(service.getRateLimitInfo(validWebhookUrl)).toBeUndefined();
        });
    });

    describe('Complex embed scenarios', () => {
        it('should handle full embed structure', async () => {
            const complexEmbed: DiscordEmbed = {
                title: 'Scrim Completed',
                description: 'A 3v3 scrim has finished',
                url: 'https://sprocket.gg/scrim/123',
                timestamp: new Date().toISOString(),
                color: 0x00ff00,
                footer: {
                    text: 'Sprocket Bot',
                    icon_url: 'https://example.com/icon.png',
                },
                thumbnail: {
                    url: 'https://example.com/thumbnail.png',
                },
                image: {
                    url: 'https://example.com/image.png',
                },
                author: {
                    name: 'Game Admin',
                    url: 'https://sprocket.gg/user/admin',
                    icon_url: 'https://example.com/author.png',
                },
                fields: [
                    { name: 'Game Mode', value: '3v3', inline: true },
                    { name: 'Duration', value: '45 minutes', inline: true },
                    { name: 'Players', value: '6 players', inline: false },
                ],
            };

            const templatePayload: DiscordWebhookPayload = {
                embeds: [complexEmbed],
            };

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: JSON.stringify(templatePayload),
            });

            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendNotification(validWebhookUrl, 'complex_embed', {});

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.embeds).toHaveLength(1);
            expect(sentPayload.embeds[0]).toMatchObject(complexEmbed);
        });

        it('should handle multiple embeds', async () => {
            const multipleEmbeds: DiscordEmbed[] = [
                {
                    title: 'Embed 1',
                    description: 'First embed',
                    color: 0xff0000,
                },
                {
                    title: 'Embed 2',
                    description: 'Second embed',
                    color: 0x00ff00,
                },
                {
                    title: 'Embed 3',
                    description: 'Third embed',
                    color: 0x0000ff,
                },
            ];

            const templatePayload: DiscordWebhookPayload = {
                embeds: multipleEmbeds,
            };

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: JSON.stringify(templatePayload),
            });

            axiosMock.onPost(validWebhookUrl).reply(204);

            await service.sendNotification(validWebhookUrl, 'multiple_embeds', {});

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.embeds).toHaveLength(3);
            expect(sentPayload.embeds).toMatchObject(multipleEmbeds);
        });
    });

    describe('Error handling', () => {
        it('should handle network errors', async () => {
            axiosMock.onPost(validWebhookUrl).networkError();

            await expect(
                service.sendSimpleMessage(validWebhookUrl, 'Test')
            ).rejects.toThrow();
        });

        it('should handle timeout errors', async () => {
            axiosMock.onPost(validWebhookUrl).timeout();

            await expect(
                service.sendSimpleMessage(validWebhookUrl, 'Test')
            ).rejects.toThrow();
        });

        it('should handle 404 errors from Discord', async () => {
            axiosMock.onPost(validWebhookUrl).reply(404, { message: 'Unknown Webhook' });

            await expect(
                service.sendSimpleMessage(validWebhookUrl, 'Test')
            ).rejects.toThrow();
        });
    });
});