import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WebhookNotificationService, WebhookRequestConfig, WebhookPayload, WebhookResponse } from '../src/gql/notification/webhook-notification.service';
import { NotificationTemplateService } from '../src/gql/notification/notification-template.service';
import { NotificationHistoryRepository } from '../src/db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../src/db/notification/user_notification_preference.repository';
import { NotificationChannel, NotificationStatus } from '../src/db/notification/notification.types';
import { NotificationHistoryEntity } from '../src/db/notification/notification_history.entity';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('WebhookNotificationService', () => {
    let service: WebhookNotificationService;
    let mockTemplateService: Partial<NotificationTemplateService>;
    let mockHistoryRepository: Partial<NotificationHistoryRepository>;
    let mockPreferenceRepository: Partial<UserNotificationPreferenceRepository>;
    let axiosMock: MockAdapter;

    const validWebhookUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz';
    const invalidWebhookUrl = 'not-a-valid-url';
    const unauthorizedWebhookUrl = 'https://unauthorized-domain.com/webhook';

    beforeEach(async () => {
        // Mock axios
        axiosMock = new MockAdapter(axios);

        // Mock services
        mockTemplateService = {
            renderTemplateFromDatabase: vi.fn(),
        };

        mockHistoryRepository = {
            create: vi.fn(),
            save: vi.fn(),
        };

        mockPreferenceRepository = {
            find: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookNotificationService,
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

        service = module.get<WebhookNotificationService>(WebhookNotificationService);
    });

    afterEach(() => {
        vi.clearAllMocks();
        axiosMock.reset();
    });

    describe('validateWebhookUrl', () => {
        it('should validate allowed webhook URLs from default allowlist', () => {
            const validUrls = [
                'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
                'https://discordapp.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
                'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
                'https://slack.com/api/webhooks/endpoint',
                'https://webhook.site/unique-id',
                'https://requestbin.com/bin/unique-id',
                'https://ngrok.io/webhook/endpoint',
                // Subdomain support
                'https://subdomain.discord.com/webhook',
                'https://api.slack.com/webhook',
            ];

            validUrls.forEach(url => {
                expect(service['validateWebhookUrl'](url)).toBe(true);
            });
        });

        it('should reject invalid webhook URLs', () => {
            const invalidUrls = [
                'not-a-url',
                '',
                'ftp://discord.com/webhook', // FTP not allowed
                'file:///etc/passwd', // File protocol not allowed
                'javascript:alert(1)', // JavaScript protocol not allowed
            ];

            invalidUrls.forEach(url => {
                expect(service['validateWebhookUrl'](url)).toBe(false);
            });
        });

        it('should reject unauthorized domains not in allowlist', () => {
            const unauthorizedUrls = [
                'https://unauthorized-domain.com/webhook',
                'https://internal-service.local/webhook',
                'https://169.254.169.254/latest/meta-data/', // AWS metadata service
                'https://localhost:8080/webhook',
                'https://127.0.0.1/webhook',
            ];

            unauthorizedUrls.forEach(url => {
                expect(service['validateWebhookUrl'](url)).toBe(false);
            });
        });

        it('should support wildcard subdomains from environment variable', async () => {
            // Set environment variable for testing
            process.env.WEBHOOK_ALLOWED_DOMAINS = '*.custom-domain.com,*.another.io';

            // Create new service instance to pick up environment variable
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    WebhookNotificationService,
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

            const newService = module.get<WebhookNotificationService>(WebhookNotificationService);

            // Test wildcard subdomain matching
            expect(newService['validateWebhookUrl']('https://sub.custom-domain.com/webhook')).toBe(true);
            expect(newService['validateWebhookUrl']('https://deep.sub.custom-domain.com/webhook')).toBe(true);
            expect(newService['validateWebhookUrl']('https://api.another.io/webhook')).toBe(true);

            // Test that root domain doesn't match wildcard
            expect(newService['validateWebhookUrl']('https://custom-domain.com/webhook')).toBe(false);

            // Clean up
            delete process.env.WEBHOOK_ALLOWED_DOMAINS;
        });
    });

    describe('validatePayload', () => {
        it('should validate JSON payload', () => {
            const validPayload = { key: 'value', number: 123 };
            expect(service['validatePayload'](validPayload, 'application/json')).toBe(true);
        });

        it('should reject invalid JSON payload', () => {
            const invalidPayload = { key: undefined }; // This will fail JSON.stringify
            expect(service['validatePayload'](invalidPayload, 'application/json')).toBe(false);
        });

        it('should validate form data payload', () => {
            const validPayload = { key1: 'value1', key2: 'value2' };
            expect(service['validatePayload'](validPayload, 'application/x-www-form-urlencoded')).toBe(true);
        });

        it('should reject empty form data payload', () => {
            expect(service['validatePayload']({}, 'application/x-www-form-urlencoded')).toBe(false);
        });

        it('should validate XML payload', () => {
            const validPayload = '<?xml version="1.0"?><root><item>value</item></root>';
            expect(service['validatePayload'](validPayload, 'application/xml')).toBe(true);
        });

        it('should validate any non-empty payload for unknown content types', () => {
            expect(service['validatePayload']({ any: 'data' }, 'unknown/type')).toBe(true);
        });

        it('should reject null or undefined payload', () => {
            expect(service['validatePayload'](null, 'application/json')).toBe(false);
            expect(service['validatePayload'](undefined, 'application/json')).toBe(false);
        });
    });

    describe('sendSimplePayload', () => {
        const mockPayload: WebhookPayload = {
            event: 'test',
            data: { key: 'value' },
        };

        it('should send simple payload successfully', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200, { success: true });

            const response = await service.sendSimplePayload(validWebhookUrl, mockPayload);

            expect(response.status).toBe(200);
            expect(response.data).toEqual({ success: true });
            expect(axiosMock.history.post.length).toBe(1);
            expect(axiosMock.history.post[0].url).toBe(validWebhookUrl);
            expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(mockPayload);
        });

        it('should send payload with custom headers', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200);

            const config: WebhookRequestConfig = {
                headers: {
                    'X-Custom-Header': 'custom-value',
                    'Authorization': 'Bearer token123',
                },
            };

            await service.sendSimplePayload(validWebhookUrl, mockPayload, config);

            expect(axiosMock.history.post[0].headers!['x-custom-header']).toBe('custom-value');
            expect(axiosMock.history.post[0].headers!['authorization']).toBe('Bearer token123');
        });

        it('should send payload with custom method', async () => {
            axiosMock.onPut(validWebhookUrl).reply(200);

            const config: WebhookRequestConfig = {
                method: 'PUT',
            };

            await service.sendSimplePayload(validWebhookUrl, mockPayload, config);

            expect(axiosMock.history.put.length).toBe(1);
            expect(axiosMock.history.put[0].url).toBe(validWebhookUrl);
        });

        it('should throw error for invalid webhook URL', async () => {
            await expect(
                service.sendSimplePayload(invalidWebhookUrl, mockPayload)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');
        });

        it('should throw error for unauthorized webhook URL', async () => {
            await expect(
                service.sendSimplePayload(unauthorizedWebhookUrl, mockPayload)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');
        });

        it('should retry on failure', async () => {
            axiosMock.onPost(validWebhookUrl).reply(500).onPost(validWebhookUrl).reply(200);

            const response = await service.sendSimplePayload(validWebhookUrl, mockPayload);

            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(2);
        });

        it('should fail after max retries', async () => {
            axiosMock.onPost(validWebhookUrl).reply(500);

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();

            expect(axiosMock.history.post.length).toBe(4); // Initial + 3 retries
        });

        it('should not retry on 4xx client errors', async () => {
            axiosMock.onPost(validWebhookUrl).reply(400, { error: 'Bad Request' });

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();

            expect(axiosMock.history.post.length).toBe(1); // No retries
        });

        it('should retry on 429 rate limit', async () => {
            axiosMock.onPost(validWebhookUrl).reply(429, {}, { 'retry-after': '1' })
                .onPost(validWebhookUrl).reply(200);

            const response = await service.sendSimplePayload(validWebhookUrl, mockPayload);

            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(2);
        });
    });

    describe('sendNotification', () => {
        const mockTemplateData = { event: 'scrim_completed', scrimId: '123' };
        const mockRenderedJson = JSON.stringify({
            event: 'scrim.completed',
            data: {
                scrimId: '123',
                gameMode: '3v3',
            },
        });

        const mockRenderedXml = '<?xml version="1.0"?><notification><event>scrim.completed</event><scrimId>123</scrimId></notification>';

        const mockRenderedForm = 'event=scrim.completed&scrimId=123&gameMode=3v3';

        beforeEach(() => {
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-123',
                channel: NotificationChannel.WEBHOOK,
                recipientId: validWebhookUrl,
                templateName: 'scrim_completed',
                templateData: mockTemplateData,
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });

            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));
        });

        it('should send notification with rendered JSON template', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200, { success: true });

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedJson,
            });

            const response = await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(mockTemplateService.renderTemplateFromDatabase).toHaveBeenCalledWith('scrim_completed', mockTemplateData);
            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(1);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.event).toBe('scrim.completed');
            expect(sentPayload.data.scrimId).toBe('123');
        });

        it('should send notification with rendered XML template', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200);

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedXml,
            });

            const response = await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(1);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.xml).toContain('<?xml version="1.0"?>');
            expect(sentPayload.xml).toContain('<scrimId>123</scrimId>');
        });

        it('should send notification with rendered form data template', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200);

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedForm,
            });

            const response = await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(1);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.event).toBe('scrim.completed');
            expect(sentPayload.scrimId).toBe('123');
        });

        it('should send notification with custom request config', async () => {
            axiosMock.onPut(validWebhookUrl).reply(200);

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedJson,
            });

            const config: WebhookRequestConfig = {
                method: 'PUT',
                headers: {
                    'X-API-Key': 'secret-key',
                },
                queryParams: {
                    source: 'sprocket',
                },
            };

            const response = await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData, config);

            expect(response.status).toBe(200);
            expect(axiosMock.history.put.length).toBe(1);
            expect(axiosMock.history.put[0].headers!['x-api-key']).toBe('secret-key');
            expect(axiosMock.history.put[0].params).toEqual({ source: 'sprocket' });
        });

        it('should throw error for invalid webhook URL', async () => {
            await expect(
                service.sendNotification(invalidWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');

            expect(mockHistoryRepository.create).toHaveBeenCalled();
            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Invalid or unauthorized webhook URL'),
                })
            );
        });

        it('should throw error for unauthorized webhook URL', async () => {
            await expect(
                service.sendNotification(unauthorizedWebhookUrl, 'scrim_completed', mockTemplateData)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');

            expect(mockHistoryRepository.create).toHaveBeenCalled();
            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Invalid or unauthorized webhook URL'),
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
            ).rejects.toThrow();

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                })
            );
        });

        it('should create and update history record on success', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200);

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedJson,
            });

            await service.sendNotification(validWebhookUrl, 'scrim_completed', mockTemplateData);

            expect(mockHistoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: NotificationChannel.WEBHOOK,
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

            mockTemplateService.renderTemplateFromDatabase = jest.fn().mockResolvedValue({
                success: true,
                rendered: mockRenderedJson,
            });

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

    describe('testWebhook', () => {
        it('should send test payload successfully', async () => {
            axiosMock.onPost(validWebhookUrl).reply(200, { success: true });

            const response = await service.testWebhook(validWebhookUrl);

            expect(response.status).toBe(200);
            expect(axiosMock.history.post.length).toBe(1);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.test).toBe(true);
            expect(sentPayload.message).toBe('Webhook test from Sprocket');
            expect(sentPayload.timestamp).toBeDefined();
        });

        it('should send test with custom method', async () => {
            axiosMock.onGet(validWebhookUrl).reply(200);

            const config: WebhookRequestConfig = {
                method: 'GET',
            };

            const response = await service.testWebhook(validWebhookUrl, config);

            expect(response.status).toBe(200);
            expect(axiosMock.history.get.length).toBe(1);
        });

        it('should throw error for invalid webhook URL', async () => {
            await expect(
                service.testWebhook(invalidWebhookUrl)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');
        });

        it('should throw error for unauthorized webhook URL', async () => {
            await expect(
                service.testWebhook(unauthorizedWebhookUrl)
            ).rejects.toThrow('Invalid or unauthorized webhook URL');
        });
    });

    describe('Error handling', () => {
        const mockPayload: WebhookPayload = { test: 'data' };

        it('should handle network errors', async () => {
            axiosMock.onPost(validWebhookUrl).networkError();

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();
        }, 10000); // Increase timeout for network error test

        it('should handle timeout errors', async () => {
            axiosMock.onPost(validWebhookUrl).timeout();

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();
        });

        it('should handle 404 errors', async () => {
            axiosMock.onPost(validWebhookUrl).reply(404, { error: 'Not Found' });

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();
        });

        it('should handle 403 forbidden errors', async () => {
            axiosMock.onPost(validWebhookUrl).reply(403, { error: 'Forbidden' });

            await expect(
                service.sendSimplePayload(validWebhookUrl, mockPayload)
            ).rejects.toThrow();

            // Should not retry on 403
            expect(axiosMock.history.post.length).toBe(1);
        });
    });

    describe('Complex payload scenarios', () => {
        it('should handle nested JSON payloads', async () => {
            const complexPayload: WebhookPayload = {
                event: 'match.completed',
                data: {
                    matchId: '456',
                    teams: [
                        { name: 'Team A', score: 3 },
                        { name: 'Team B', score: 1 },
                    ],
                    metadata: {
                        duration: 3600,
                        map: 'de_dust2',
                    },
                },
                timestamp: new Date().toISOString(),
            };

            axiosMock.onPost(validWebhookUrl).reply(200);

            await service.sendSimplePayload(validWebhookUrl, complexPayload);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload).toMatchObject(complexPayload);
        });

        it('should handle array payloads', async () => {
            const arrayPayload: WebhookPayload = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' },
            ];

            axiosMock.onPost(validWebhookUrl).reply(200);

            await service.sendSimplePayload(validWebhookUrl, arrayPayload);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(Array.isArray(sentPayload)).toBe(true);
            expect(sentPayload).toHaveLength(3);
        });

        it('should handle payloads with special characters', async () => {
            const specialPayload: WebhookPayload = {
                message: 'Hello "World" & <Friends>!',
                data: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
            };

            axiosMock.onPost(validWebhookUrl).reply(200);

            await service.sendSimplePayload(validWebhookUrl, specialPayload);

            const sentPayload = JSON.parse(axiosMock.history.post[0].data);
            expect(sentPayload.message).toBe('Hello "World" & <Friends>!');
        });
    });
});