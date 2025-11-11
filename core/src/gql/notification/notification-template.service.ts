import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { NotificationTemplateEntity } from '../../db/notification/notification_template.entity';
import { NotificationTemplateRepository } from '../../db/notification/notification_template.repository';

export interface TemplateRenderResult {
    success: boolean;
    rendered?: string;
    error?: string;
}

@Injectable()
export class NotificationTemplateService {
    private readonly logger = new Logger(NotificationTemplateService.name);
    private readonly compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();
    private readonly handlebars: typeof Handlebars;

    constructor(
        private readonly templateRepository: NotificationTemplateRepository,
    ) {
        this.handlebars = Handlebars.create();
        this.registerHelpers();
    }

    /**
     * Register common helper functions for template rendering
     */
    private registerHelpers(): void {
        // Date formatting helper
        this.handlebars.registerHelper('formatDate', (date: Date | string, format: string = 'YYYY-MM-DD') => {
            try {
                const dateObj = date instanceof Date ? date : new Date(date);
                if (isNaN(dateObj.getTime())) return '';

                switch (format) {
                    case 'YYYY-MM-DD':
                        return dateObj.toISOString().split('T')[0];
                    case 'DD/MM/YYYY':
                        return dateObj.toLocaleDateString('en-GB');
                    case 'MM/DD/YYYY':
                        return dateObj.toLocaleDateString('en-US');
                    case 'relative':
                        return this.getRelativeTime(dateObj);
                    default:
                        return dateObj.toISOString();
                }
            } catch (error) {
                this.logger.warn(`Date formatting failed for ${date}: ${error.message}`);
                return String(date);
            }
        });

        // Number formatting helper
        this.handlebars.registerHelper('formatNumber', (num: number, format: string = 'decimal') => {
            try {
                if (typeof num !== 'number' || isNaN(num)) return '0';

                switch (format) {
                    case 'decimal':
                        return num.toLocaleString();
                    case 'percent':
                        return `${(num * 100).toFixed(1)}%`;
                    case 'currency':
                        return `$${num.toFixed(2)}`;
                    default:
                        return num.toString();
                }
            } catch (error) {
                this.logger.warn(`Number formatting failed for ${num}: ${error.message}`);
                return String(num);
            }
        });

        // String manipulation helpers
        this.handlebars.registerHelper('uppercase', (str: string) => {
            return typeof str === 'string' ? str.toUpperCase() : String(str);
        });

        this.handlebars.registerHelper('lowercase', (str: string) => {
            return typeof str === 'string' ? str.toLowerCase() : String(str);
        });

        this.handlebars.registerHelper('capitalize', (str: string) => {
            if (typeof str !== 'string') return String(str);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        });

        // Conditional helpers
        this.handlebars.registerHelper('ifEquals', function (arg1: any, arg2: any, options: any) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });

        this.handlebars.registerHelper('ifNotEquals', function (arg1: any, arg2: any, options: any) {
            return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
        });

        // Array helpers
        this.handlebars.registerHelper('join', (array: any[], separator: string = ', ') => {
            if (!Array.isArray(array)) return '';
            return array.map(item => String(item)).join(separator);
        });

        this.handlebars.registerHelper('length', (array: any[]) => {
            return Array.isArray(array) ? array.length : 0;
        });

        // Default value helper
        this.handlebars.registerHelper('default', (value: any, defaultValue: any) => {
            return value ?? defaultValue;
        });
    }

    /**
     * Get relative time string (e.g., "2 hours ago")
     */
    private getRelativeTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    /**
     * Compile a template string and cache it
     */
    private compileTemplate(templateString: string, templateKey: string): HandlebarsTemplateDelegate {
        // Check if already compiled
        if (this.compiledTemplates.has(templateKey)) {
            return this.compiledTemplates.get(templateKey)!;
        }

        try {
            const compiled = this.handlebars.compile(templateString);
            this.compiledTemplates.set(templateKey, compiled);
            return compiled;
        } catch (error) {
            this.logger.error(`Template compilation failed for key ${templateKey}: ${error.message}`);
            throw new Error(`Template compilation failed: ${error.message}`);
        }
    }

    /**
     * Render a template string with provided data
     */
    public renderTemplate(templateString: string, data: Record<string, any>, templateKey?: string): TemplateRenderResult {
        try {
            const key = templateKey || `inline_${Buffer.from(templateString).toString('base64')}`;
            const compiled = this.compileTemplate(templateString, key);

            // Merge with default data if provided
            const renderData = data;

            const rendered = compiled(renderData);

            return {
                success: true,
                rendered,
            };
        } catch (error) {
            const errorMessage = `Template rendering failed: ${error.message}`;
            this.logger.error(errorMessage, { templateKey, error });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Fetch template from database and render it with provided data
     */
    public async renderTemplateFromDatabase(
        templateName: string,
        data: Record<string, any>
    ): Promise<TemplateRenderResult> {
        try {
            // Fetch template from database
            const template = await this.templateRepository.findOne({
                where: { name: templateName },
            });

            if (!template) {
                const errorMessage = `Template not found: ${templateName}`;
                this.logger.error(errorMessage);
                return {
                    success: false,
                    error: errorMessage,
                };
            }

            // Merge default data with provided data
            const renderData = {
                ...template.defaultData,
                ...data,
            };

            // Render the template
            return this.renderTemplate(template.content, renderData, templateName);
        } catch (error) {
            const errorMessage = `Failed to fetch and render template ${templateName}: ${error.message}`;
            this.logger.error(errorMessage, { templateName, error });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Clear the template cache
     */
    public clearCache(): void {
        this.compiledTemplates.clear();
        this.logger.log('Template cache cleared');
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.compiledTemplates.size,
            keys: Array.from(this.compiledTemplates.keys()),
        };
    }

    /**
     * Pre-compile templates from database for better performance
     */
    public async precompileTemplates(): Promise<void> {
        try {
            const templates = await this.templateRepository.find();

            for (const template of templates) {
                try {
                    this.compileTemplate(template.content, template.name);
                    this.logger.log(`Pre-compiled template: ${template.name}`);
                } catch (error) {
                    this.logger.warn(`Failed to pre-compile template ${template.name}: ${error.message}`);
                }
            }

            this.logger.log(`Pre-compiled ${templates.length} templates`);
        } catch (error) {
            this.logger.error(`Failed to pre-compile templates: ${error.message}`, error);
        }
    }
}