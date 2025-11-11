import { Test, TestingModule } from '@nestjs/testing';
import { DiscordNotificationService } from './discord-notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationTemplateRepository } from '../../db/notification/notification_template.repository';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import axios from 'axios';

/**
 * Integration tests for Discord notification service with template rendering
 */
describe('DiscordNotificationService Integration', () => {
    let discordService: DiscordNotificationService;
    let templateService: NotificationTemplateService;
    let mockTemplateRepository: Partial<NotificationTemplateRepository>;
    let mockHistoryRepository: Partial<NotificationHistoryRepository>;
    let mockPreferenceRepository: Partial<UserNotificationPreferenceRepository>;
    let axiosPostMock: jest.Mock;

    const validWebhookUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz';

    beforeEach(async () => {
        // Mock axios post
        axiosPostMock = jest.fn();
        (axios as any).post = axiosPostMock;
        (axios as any).history = { post: [] };

        // Mock repositories
        mockTemplateRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
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
                NotificationTemplateService,
                {
                    provide: NotificationTemplateRepository,
                    useValue: mockTemplateRepository,
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

        discordService = module.get<DiscordNotificationService>(DiscordNotificationService);
        templateService = module.get<NotificationTemplateService>(NotificationTemplateService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        discordService.clearRateLimitCache();
    });

    describe('Template integration scenarios', () => {
        it('should render and send scrim completion notification', async () => {
            // Mock template from database
            const scrimTemplate: Partial<NotificationTemplateEntity> = {
                name: 'scrim_completed',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({
                    content: 'Scrim completed!',
                    embeds: [{
                        title: 'Scrim #{{scrimId}} Completed',
                        description: 'Game Mode: {{gameMode}}',
                        color: 0x00ff00,
                        fields: [
                            {
                                name: 'Duration',
                                value: '{{duration}} minutes',
                                inline: true,
                            },
                            {
                                name: 'Players',
                                value: '{{playerCount}} players',
                                inline: true,
                            },
                        ],
                        timestamp: '{{formatDate completedAt "ISO"}}',
                    }],
                }),
                defaultData: {
                    color: 0x00ff00,
                },
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(scrimTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-123',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'scrim_completed',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            axiosPostMock.mockResolvedValue({ status: 204, data: {} });

            const templateData = {
                scrimId: '12345',
                gameMode: '3v3',
                duration: 45,
                playerCount: 6,
                completedAt: new Date('2023-12-25T10:30:00Z'),
            };

            await discordService.sendNotification(validWebhookUrl, 'scrim_completed', templateData);

            // Verify template was fetched and rendered
            expect(mockTemplateRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'scrim_completed' },
            });

            // Verify the sent payload
            expect(axiosPostMock).toHaveBeenCalled();
            const callArgs = axiosPostMock.mock.calls[0];
            const payload = JSON.parse(callArgs[1]);

            expect(payload.content).toBe('Scrim completed!');
            expect(payload.embeds).toHaveLength(1);
            expect(payload.embeds[0].title).toBe('Scrim #12345 Completed');
            expect(payload.embeds[0].description).toBe('Game Mode: 3v3');
            expect(payload.embeds[0].color).toBe(0x00ff00);
            expect(payload.embeds[0].fields).toHaveLength(2);
            expect(payload.embeds[0].fields[0].value).toBe('45 minutes');
            expect(payload.embeds[0].fields[1].value).toBe('6 players');
            expect(payload.embeds[0].timestamp).toBe('2023-12-25T10:30:00.000Z');
        });

        it('should render match notification with complex data', async () => {
            const matchTemplate: Partial<NotificationTemplateEntity> = {
                name: 'match_completed',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({
                    embeds: [{
                        title: 'Match Completed - {{matchName}}',
                        description: '{{team1Name}} vs {{team2Name}}',
                        color: '{{#ifEquals winner "team1"}}0x00ff00{{else}}0xff0000{{/ifEquals}}',
                        fields: [
                            {
                                name: '{{team1Name}}',
                                value: '{{team1Score}}',
                                inline: true,
                            },
                            {
                                name: '{{team2Name}}',
                                value: '{{team2Score}}',
                                inline: true,
                            },
                            {
                                name: 'Winner',
                                value: '{{winnerName}}',
                                inline: false,
                            },
                        ],
                        footer: {
                            text: 'League: {{leagueName}} | Round: {{round}}',
                        },
                    }],
                }),
                defaultData: {
                    color: 0x808080,
                },
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(matchTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-456',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'match_completed',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            axiosPostMock.mockResolvedValue({ status: 204, data: {} });

            const templateData = {
                matchName: 'Championship Finals',
                team1Name: 'Alpha Team',
                team2Name: 'Beta Team',
                team1Score: 5,
                team2Score: 3,
                winner: 'team1',
                winnerName: 'Alpha Team',
                leagueName: 'Pro League',
                round: 'Finals',
            };

            await discordService.sendNotification(validWebhookUrl, 'match_completed', templateData);

            const callArgs = axiosPostMock.mock.calls[0];
            const sentPayload = JSON.parse(callArgs[1]);

            expect(sentPayload.embeds[0].title).toBe('Match Completed - Championship Finals');
            expect(sentPayload.embeds[0].description).toBe('Alpha Team vs Beta Team');
            expect(sentPayload.embeds[0].color).toBe('0x00ff00'); // Winner is team1
            expect(sentPayload.embeds[0].fields[0].value).toBe('5');
            expect(sentPayload.embeds[0].fields[1].value).toBe('3');
            expect(sentPayload.embeds[0].footer.text).toBe('League: Pro League | Round: Finals');
        });

        it('should handle submission approval notification', async () => {
            const submissionTemplate: Partial<NotificationTemplateEntity> = {
                name: 'submission_approved',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({
                    content: '✅ Submission Approved!',
                    embeds: [{
                        title: 'Submission #{{submissionId}}',
                        description: '{{submissionType}} by {{playerName}}',
                        color: 0x00ff00,
                        fields: [
                            {
                                name: 'Game',
                                value: '{{gameName}}',
                                inline: true,
                            },
                            {
                                name: 'Skill Group',
                                value: '{{skillGroup}}',
                                inline: true,
                            },
                            {
                                name: 'Approved By',
                                value: '{{approvedBy}}',
                                inline: false,
                            },
                        ],
                        thumbnail: {
                            url: '{{playerAvatarUrl}}',
                        },
                        timestamp: '{{formatDate approvedAt "ISO"}}',
                    }],
                }),
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(submissionTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-789',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'submission_approved',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            axiosPostMock.mockResolvedValue({ status: 204, data: {} });

            const templateData = {
                submissionId: '789',
                submissionType: 'Replay File',
                playerName: 'JohnDoe',
                gameName: 'Rocket League',
                skillGroup: 'Grand Champion',
                approvedBy: 'Admin_User',
                playerAvatarUrl: 'https://example.com/avatar.png',
                approvedAt: new Date('2023-12-25T15:45:00Z'),
            };

            await discordService.sendNotification(validWebhookUrl, 'submission_approved', templateData);

            const callArgs = axiosPostMock.mock.calls[0];
            const sentPayload = JSON.parse(callArgs[1]);

            expect(sentPayload.content).toBe('✅ Submission Approved!');
            expect(sentPayload.embeds[0].title).toBe('Submission #789');
            expect(sentPayload.embeds[0].description).toBe('Replay File by JohnDoe');
            expect(sentPayload.embeds[0].thumbnail.url).toBe('https://example.com/avatar.png');
            expect(sentPayload.embeds[0].fields[2].value).toBe('Admin_User');
        });

        it('should handle template with default data merging', async () => {
            const templateWithDefaults: Partial<NotificationTemplateEntity> = {
                name: 'default_test',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({
                    content: 'Hello {{name}}! Welcome to {{serverName}}.',
                }),
                defaultData: {
                    serverName: 'Sprocket Gaming',
                    welcomeMessage: 'Welcome!',
                },
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(templateWithDefaults);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-999',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'default_test',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            axiosPostMock.mockResolvedValue({ status: 204, data: {} });

            // Only provide name, serverName should come from defaults
            await discordService.sendNotification(validWebhookUrl, 'default_test', {
                name: 'NewUser',
            });

            const callArgs = axiosPostMock.mock.calls[0];
            const sentPayload = JSON.parse(callArgs[1]);
            expect(sentPayload.content).toBe('Hello NewUser! Welcome to Sprocket Gaming.');
        });

        it('should handle array data in templates', async () => {
            const arrayTemplate: Partial<NotificationTemplateEntity> = {
                name: 'player_list',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({
                    embeds: [{
                        title: 'Team Roster',
                        description: '{{teamName}}',
                        fields: [
                            '{{#each players}}',
                            {
                                name: '{{name}}',
                                value: 'Role: {{role}} | MMR: {{mmr}}',
                                inline: true,
                            },
                            '{{/each}}',
                        ],
                    }],
                }),
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(arrayTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-111',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'player_list',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            axiosPostMock.mockResolvedValue({ status: 204, data: {} });

            const templateData = {
                teamName: 'Alpha Squad',
                players: [
                    { name: 'Player1', role: 'Captain', mmr: 1500 },
                    { name: 'Player2', role: 'Player', mmr: 1400 },
                    { name: 'Player3', role: 'Player', mmr: 1350 },
                ],
            };

            await discordService.sendNotification(validWebhookUrl, 'player_list', templateData);

            const callArgs = axiosPostMock.mock.calls[0];
            const sentPayload = JSON.parse(callArgs[1]);

            expect(sentPayload.embeds[0].title).toBe('Team Roster');
            expect(sentPayload.embeds[0].description).toBe('Alpha Squad');
            expect(sentPayload.embeds[0].fields).toHaveLength(3);
            expect(sentPayload.embeds[0].fields[0].name).toBe('Player1');
            expect(sentPayload.embeds[0].fields[0].value).toBe('Role: Captain | MMR: 1500');
        });
    });

    describe('Error handling integration', () => {
        it('should handle template not found gracefully', async () => {
            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(
                discordService.sendNotification(validWebhookUrl, 'nonexistent_template', {})
            ).rejects.toThrow('Template not found: nonexistent_template');

            expect(mockHistoryRepository.create).toHaveBeenCalled();
            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Template not found'),
                })
            );
        });

        it('should handle database errors during template fetch', async () => {
            mockTemplateRepository.findOne = jest.fn().mockRejectedValue(new Error('Database connection failed'));

            await expect(
                discordService.sendNotification(validWebhookUrl, 'test_template', {})
            ).rejects.toThrow('Failed to fetch and render template');

            expect(mockHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.FAILED,
                    errorMessage: expect.stringContaining('Database connection failed'),
                })
            );
        });

        it('should handle Discord API errors and retry', async () => {
            const testTemplate: Partial<NotificationTemplateEntity> = {
                name: 'test_template',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({ content: 'Test message' }),
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(testTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-error',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'test_template',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            // Fail first 2 attempts, succeed on 3rd
            let callCount = 0;
            axiosPostMock.mockImplementation(() => {
                callCount++;
                if (callCount <= 2) {
                    return Promise.reject({ response: { status: 500 } });
                }
                return Promise.resolve({ status: 204, data: {} });
            });

            await discordService.sendNotification(validWebhookUrl, 'test_template', {});

            expect(axiosPostMock).toHaveBeenCalledTimes(3);
            expect(mockHistoryRepository.save).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.SENT,
                    retryCount: 0, // Reset on success
                })
            );
        });
    });

    describe('Rate limiting integration', () => {
        it('should handle rate limiting across multiple notifications', async () => {
            const testTemplate: Partial<NotificationTemplateEntity> = {
                name: 'test_template',
                channel: NotificationChannel.DISCORD,
                content: JSON.stringify({ content: 'Test message {{id}}' }),
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(testTemplate);
            mockHistoryRepository.create = jest.fn().mockReturnValue({
                id: 'history-rate-limit',
                channel: NotificationChannel.DISCORD,
                recipientId: validWebhookUrl,
                templateName: 'test_template',
                templateData: {},
                status: NotificationStatus.PENDING,
                retryCount: 0,
            });
            mockHistoryRepository.save = jest.fn().mockImplementation(entity => Promise.resolve(entity));

            // First request sets rate limit to 0 remaining
            const rateLimitHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': (Date.now() / 1000 + 1).toString(), // Reset in 1 second
            };

            axiosPostMock.mockResolvedValueOnce({
                status: 204,
                data: {},
                headers: rateLimitHeaders,
            });

            // Send first notification
            await discordService.sendNotification(validWebhookUrl, 'test_template', { id: 1 });

            // Verify rate limit info was captured
            const rateLimitInfo = discordService.getRateLimitInfo(validWebhookUrl);
            expect(rateLimitInfo).toBeDefined();
            expect(rateLimitInfo?.remaining).toBe(0);

            // Mock reset for subsequent requests
            const resetHeaders = {
                'x-ratelimit-limit': '5',
                'x-ratelimit-remaining': '5',
                'x-ratelimit-reset': (Date.now() / 1000 + 10).toString(),
            };

            axiosPostMock.mockResolvedValue({
                status: 204,
                data: {},
                headers: resetHeaders,
            });

            // Second notification should be queued and processed after rate limit reset
            const secondNotificationPromise = discordService.sendNotification(validWebhookUrl, 'test_template', { id: 2 });

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            await secondNotificationPromise;

            expect(axiosPostMock).toHaveBeenCalledTimes(2);
        });
    });
});