import { Test, TestingModule } from '@nestjs/testing';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateRepository } from '../../db/notification/notification_template.repository';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import { NotificationChannel } from '../../db/notification/notification.types';

describe('NotificationTemplateService', () => {
    let service: NotificationTemplateService;
    let mockTemplateRepository: Partial<NotificationTemplateRepository>;

    beforeEach(async () => {
        mockTemplateRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationTemplateService,
                {
                    provide: NotificationTemplateRepository,
                    useValue: mockTemplateRepository,
                },
            ],
        }).compile();

        service = module.get<NotificationTemplateService>(NotificationTemplateService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        service.clearCache();
    });

    describe('renderTemplate', () => {
        it('should render a simple template with data', () => {
            const template = 'Hello {{name}}!';
            const data = { name: 'World' };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Hello World!');
        });

        it('should render a template with nested data', () => {
            const template = 'User: {{user.name}}, Age: {{user.age}}';
            const data = {
                user: { name: 'John', age: 30 }
            };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('User: John, Age: 30');
        });

        it('should handle missing variables gracefully', () => {
            const template = 'Hello {{name}}! You are {{age}} years old.';
            const data = { name: 'John' };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Hello John! You are  years old.');
        });

        it('should cache compiled templates', () => {
            const template = 'Cached: {{value}}';
            const data1 = { value: 'first' };
            const data2 = { value: 'second' };

            const result1 = service.renderTemplate(template, data1, 'test_key');
            const result2 = service.renderTemplate(template, data2, 'test_key');

            expect(result1.success).toBe(true);
            expect(result1.rendered).toBe('Cached: first');
            expect(result2.success).toBe(true);
            expect(result2.rendered).toBe('Cached: second');

            const stats = service.getCacheStats();
            expect(stats.size).toBe(1);
            expect(stats.keys).toContain('test_key');
        });

        it('should handle template compilation errors', () => {
            const template = 'Invalid {{template';
            const data = {};

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('Template rendering failed');
        });
    });

    describe('Helper functions', () => {
        it('should format dates correctly', () => {
            const template = 'Date: {{formatDate date "YYYY-MM-DD"}}';
            const data = { date: new Date('2023-12-25') };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Date: 2023-12-25');
        });

        it('should format numbers correctly', () => {
            const template = 'Number: {{formatNumber number "decimal"}} | Percent: {{formatNumber number "percent"}}';
            const data = { number: 0.85 };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Number: 0.85 | Percent: 85.0%');
        });

        it('should convert case correctly', () => {
            const template = 'Upper: {{uppercase text}} | Lower: {{lowercase text}} | Capitalize: {{capitalize text}}';
            const data = { text: 'hello WORLD' };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Upper: HELLO WORLD | Lower: hello world | Capitalize: Hello world');
        });

        it('should handle conditional logic', () => {
            const template = '{{#ifEquals status "active"}}Active{{else}}Inactive{{/ifEquals}}';

            const result1 = service.renderTemplate(template, { status: 'active' });
            expect(result1.success).toBe(true);
            expect(result1.rendered).toBe('Active');

            const result2 = service.renderTemplate(template, { status: 'inactive' });
            expect(result2.success).toBe(true);
            expect(result2.rendered).toBe('Inactive');
        });

        it('should join arrays correctly', () => {
            const template = 'Items: {{join items ", "}}';
            const data = { items: ['apple', 'banana', 'orange'] };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Items: apple, banana, orange');
        });

        it('should provide default values', () => {
            const template = 'Value: {{default value "N/A"}}';

            const result1 = service.renderTemplate(template, { value: null });
            expect(result1.rendered).toBe('Value: N/A');

            const result2 = service.renderTemplate(template, { value: 'present' });
            expect(result2.rendered).toBe('Value: present');
        });
    });

    describe('renderTemplateFromDatabase', () => {
        it('should fetch template from database and render it', async () => {
            const mockTemplate: Partial<NotificationTemplateEntity> = {
                name: 'test_template',
                content: 'Hello {{name}}! Welcome to {{place}}.',
                defaultData: { place: 'Sprocket' },
                channel: NotificationChannel.IN_APP,
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(mockTemplate);

            const result = await service.renderTemplateFromDatabase('test_template', { name: 'John' });

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('Hello John! Welcome to Sprocket.');
            expect(mockTemplateRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'test_template' },
            });
        });

        it('should merge default data with provided data', async () => {
            const mockTemplate: Partial<NotificationTemplateEntity> = {
                name: 'test_template',
                content: 'User: {{name}}, Role: {{role}}, Team: {{team}}',
                defaultData: { role: 'Player', team: 'Unknown' },
                channel: NotificationChannel.IN_APP,
            };

            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(mockTemplate);

            const result = await service.renderTemplateFromDatabase('test_template', { name: 'John', team: 'Alpha' });

            expect(result.success).toBe(true);
            expect(result.rendered).toBe('User: John, Role: Player, Team: Alpha');
        });

        it('should handle template not found', async () => {
            mockTemplateRepository.findOne = jest.fn().mockResolvedValue(null);

            const result = await service.renderTemplateFromDatabase('nonexistent_template', {});

            expect(result.success).toBe(false);
            expect(result.error).toBe('Template not found: nonexistent_template');
        });

        it('should handle database errors', async () => {
            mockTemplateRepository.findOne = jest.fn().mockRejectedValue(new Error('Database connection failed'));

            const result = await service.renderTemplateFromDatabase('test_template', {});

            expect(result.success).toBe(false);
            expect(result.error).toContain('Failed to fetch and render template');
        });
    });

    describe('Cache management', () => {
        it('should clear cache', () => {
            const template = 'Test: {{value}}';
            service.renderTemplate(template, { value: 'test' }, 'key1');
            service.renderTemplate(template, { value: 'test' }, 'key2');

            let stats = service.getCacheStats();
            expect(stats.size).toBe(2);

            service.clearCache();

            stats = service.getCacheStats();
            expect(stats.size).toBe(0);
        });

        it('should return cache statistics', () => {
            const template = 'Test: {{value}}';
            service.renderTemplate(template, { value: 'test1' }, 'key1');
            service.renderTemplate(template, { value: 'test2' }, 'key2');

            const stats = service.getCacheStats();

            expect(stats.size).toBe(2);
            expect(stats.keys).toContain('key1');
            expect(stats.keys).toContain('key2');
        });
    });

    describe('precompileTemplates', () => {
        it('should precompile all templates from database', async () => {
            const mockTemplates: Partial<NotificationTemplateEntity>[] = [
                {
                    name: 'template1',
                    content: 'Template 1: {{value}}',
                    channel: NotificationChannel.IN_APP,
                },
                {
                    name: 'template2',
                    content: 'Template 2: {{value}}',
                    channel: NotificationChannel.EMAIL,
                },
            ];

            mockTemplateRepository.find = jest.fn().mockResolvedValue(mockTemplates);

            await service.precompileTemplates();

            const stats = service.getCacheStats();
            expect(stats.size).toBe(2);
            expect(stats.keys).toContain('template1');
            expect(stats.keys).toContain('template2');
        });

        it('should handle errors during precompilation', async () => {
            const mockTemplates: Partial<NotificationTemplateEntity>[] = [
                {
                    name: 'valid_template',
                    content: 'Valid: {{value}}',
                    channel: NotificationChannel.IN_APP,
                },
                {
                    name: 'invalid_template',
                    content: 'Invalid {{template',
                    channel: NotificationChannel.EMAIL,
                },
            ];

            mockTemplateRepository.find = jest.fn().mockResolvedValue(mockTemplates);

            // Should not throw, but log warnings
            await service.precompileTemplates();

            const stats = service.getCacheStats();
            // Both templates are attempted to be compiled, but invalid one fails
            expect(stats.size).toBeGreaterThanOrEqual(1);
            expect(stats.keys).toContain('valid_template');
        });
    });

    describe('Complex template scenarios', () => {
        it('should handle Discord embed templates', () => {
            const template = `{
                "embeds": [{
                    "title": "{{title}}",
                    "description": "{{description}}",
                    "fields": [{{#each fields}}{"name": "{{name}}", "value": "{{value}}", "inline": {{#if inline}}true{{else}}false{{/if}}}{{#unless @last}},{{/unless}}{{/each}}],
                    "timestamp": "{{formatDate timestamp \"ISO\"}}"
                }]
            }`;

            const data = {
                title: 'Scrim Completed',
                description: 'Scrim #12345 has finished',
                fields: [
                    { name: 'Game Mode', value: '3v3', inline: true },
                    { name: 'Duration', value: '45 minutes', inline: true },
                ],
                timestamp: new Date(),
            };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toContain('Scrim Completed');
            expect(result.rendered).toContain('3v3');
        });

        it('should handle nested loops and conditionals', () => {
            const template = `
                {{#each teams}}
                Team: {{name}}
                {{#each players}}
                - {{name}} ({{#if captain}}Captain{{else}}Player{{/if}})
                {{/each}}
                {{/each}}
            `;

            const data = {
                teams: [
                    {
                        name: 'Alpha',
                        players: [
                            { name: 'John', captain: true },
                            { name: 'Jane', captain: false },
                        ],
                    },
                ],
            };

            const result = service.renderTemplate(template, data);

            expect(result.success).toBe(true);
            expect(result.rendered).toContain('Team: Alpha');
            expect(result.rendered).toContain('John (Captain)');
            expect(result.rendered).toContain('Jane (Player)');
        });
    });
});