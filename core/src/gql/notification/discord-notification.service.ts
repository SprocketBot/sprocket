import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';

export interface DiscordEmbed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
    };
    image?: {
        url: string;
    };
    thumbnail?: {
        url: string;
    };
    author?: {
        name: string;
        url?: string;
        icon_url?: string;
    };
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
}

export interface DiscordWebhookPayload {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: DiscordEmbed[];
    thread_name?: string;
}

export interface DiscordRateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter: number;
}

@Injectable()
export class DiscordNotificationService {
    private readonly logger = new Logger(DiscordNotificationService.name);
    private readonly httpClient: AxiosInstance;
    private readonly rateLimitMap = new Map<string, DiscordRateLimitInfo>();
    private readonly webhookQueue = new Map<string, Array<() => Promise<void>>>();
    private readonly MAX_RETRIES = 3;
    private readonly BASE_DELAY = 1000;
    private readonly RATE_LIMIT_BUFFER = 100; // 100ms buffer for rate limit reset

    constructor(
        private readonly templateService: NotificationTemplateService,
        private readonly historyRepository: NotificationHistoryRepository,
        private readonly preferenceRepository: UserNotificationPreferenceRepository,
    ) {
        this.httpClient = axios.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SprocketBot/1.0',
            },
        });

        // Add response interceptor to handle rate limits
        this.httpClient.interceptors.response.use(
            (response) => {
                this.updateRateLimitInfo(response.config.url!, response.headers);
                return response;
            },
            (error: AxiosError) => {
                if (error.config?.url) {
                    this.updateRateLimitInfo(error.config.url, error.response?.headers || {});
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Validate Discord webhook URL format
     */
    private validateWebhookUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            const discordWebhookPattern = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;
            return discordWebhookPattern.test(parsedUrl.toString());
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract webhook ID from URL for rate limiting
     */
    private getWebhookId(url: string): string {
        try {
            const match = url.match(/\/webhooks\/(\d+)\//);
            return match ? match[1] : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Update rate limit information from response headers
     */
    private updateRateLimitInfo(url: string, headers: Record<string, any>): void {
        const webhookId = this.getWebhookId(url);
        const rateLimit = headers['x-ratelimit-limit'];
        const rateLimitRemaining = headers['x-ratelimit-remaining'];
        const rateLimitReset = headers['x-ratelimit-reset'];
        const retryAfter = headers['retry-after'];

        if (rateLimit && rateLimitRemaining && rateLimitReset) {
            const info: DiscordRateLimitInfo = {
                limit: parseInt(rateLimit, 10),
                remaining: parseInt(rateLimitRemaining, 10),
                reset: parseInt(rateLimitReset, 10) * 1000, // Convert to milliseconds
                retryAfter: retryAfter ? parseInt(retryAfter, 10) * 1000 : 0,
            };
            this.rateLimitMap.set(webhookId, info);
        }
    }

    /**
     * Check if we should wait before sending to this webhook
     */
    private async checkRateLimit(webhookUrl: string): Promise<void> {
        const webhookId = this.getWebhookId(webhookUrl);
        const rateLimitInfo = this.rateLimitMap.get(webhookId);

        if (!rateLimitInfo) return;

        const now = Date.now();
        const timeUntilReset = rateLimitInfo.reset - now;

        if (rateLimitInfo.remaining <= 0 && timeUntilReset > 0) {
            this.logger.warn(`Rate limit hit for webhook ${webhookId}, waiting ${timeUntilReset}ms`);
            await new Promise(resolve => setTimeout(resolve, timeUntilReset + this.RATE_LIMIT_BUFFER));
        } else if (rateLimitInfo.retryAfter > 0) {
            const retryDelay = rateLimitInfo.retryAfter;
            this.logger.warn(`Retry-After header received for webhook ${webhookId}, waiting ${retryDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, retryDelay + this.RATE_LIMIT_BUFFER));
        }
    }

    /**
     * Queue webhook request if rate limited
     */
    private async queueWebhookRequest(webhookUrl: string, requestFn: () => Promise<void>): Promise<void> {
        const webhookId = this.getWebhookId(webhookUrl);
        const rateLimitInfo = this.rateLimitMap.get(webhookId);

        if (rateLimitInfo && rateLimitInfo.remaining <= 0) {
            // Queue the request
            if (!this.webhookQueue.has(webhookId)) {
                this.webhookQueue.set(webhookId, []);
            }
            this.webhookQueue.get(webhookId)!.push(requestFn);

            this.logger.debug(`Queued request for webhook ${webhookId}, queue size: ${this.webhookQueue.get(webhookId)!.length}`);

            // Process queue when rate limit resets
            const timeUntilReset = rateLimitInfo.reset - Date.now();
            setTimeout(() => this.processQueue(webhookId), timeUntilReset + this.RATE_LIMIT_BUFFER);
        } else {
            await requestFn();
        }
    }

    /**
     * Process queued webhook requests
     */
    private async processQueue(webhookId: string): Promise<void> {
        const queue = this.webhookQueue.get(webhookId);
        if (!queue || queue.length === 0) {
            this.webhookQueue.delete(webhookId);
            return;
        }

        this.logger.log(`Processing queue for webhook ${webhookId}, ${queue.length} requests pending`);

        while (queue.length > 0) {
            const requestFn = queue.shift()!;
            try {
                await requestFn();
            } catch (error) {
                this.logger.error(`Failed to process queued request for webhook ${webhookId}`, error);
            }

            // Small delay between queued requests to avoid hitting rate limits again
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.webhookQueue.delete(webhookId);
    }

    /**
     * Send webhook with exponential backoff retry
     */
    private async sendWebhookWithRetry(webhookUrl: string, payload: DiscordWebhookPayload, retryCount = 0): Promise<void> {
        try {
            await this.checkRateLimit(webhookUrl);

            const response = await this.httpClient.post(webhookUrl, payload);
            this.logger.debug(`Discord webhook sent successfully: ${response.status}`);

        } catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 429) {
                // Rate limited - queue the request
                this.logger.warn(`Rate limited by Discord, queuing request for ${webhookUrl}`);
                await this.queueWebhookRequest(webhookUrl, () => this.sendWebhookWithRetry(webhookUrl, payload, retryCount));
                return;
            }

            if (retryCount < this.MAX_RETRIES) {
                const delay = Math.pow(2, retryCount) * this.BASE_DELAY;
                this.logger.warn(`Webhook failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`, {
                    error: axiosError.message,
                    status: axiosError.response?.status,
                });

                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendWebhookWithRetry(webhookUrl, payload, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Create notification history record
     */
    private async createHistoryRecord(
        webhookUrl: string,
        templateName: string,
        templateData: Record<string, any>,
        status: NotificationStatus,
        errorMessage?: string,
    ): Promise<NotificationHistoryEntity> {
        const history = this.historyRepository.create({
            channel: NotificationChannel.DISCORD,
            recipientId: webhookUrl,
            templateName,
            templateData,
            status,
            errorMessage,
            retryCount: 0,
        });

        return this.historyRepository.save(history);
    }

    /**
     * Update notification history record
     */
    private async updateHistoryRecord(
        history: NotificationHistoryEntity,
        status: NotificationStatus,
        errorMessage?: string,
    ): Promise<NotificationHistoryEntity> {
        history.status = status;
        history.errorMessage = errorMessage;
        history.sentAt = status === NotificationStatus.SENT ? new Date() : undefined;

        if (status === NotificationStatus.FAILED) {
            history.retryCount++;
        }

        return this.historyRepository.save(history);
    }

    /**
     * Send notification to Discord webhook
     */
    public async sendNotification(
        webhookUrl: string,
        templateName: string,
        templateData: Record<string, any>,
        options: {
            username?: string;
            avatarUrl?: string;
        } = {},
    ): Promise<void> {
        // Validate webhook URL
        if (!this.validateWebhookUrl(webhookUrl)) {
            const errorMessage = `Invalid Discord webhook URL: ${webhookUrl}`;
            this.logger.error(errorMessage);
            await this.createHistoryRecord(webhookUrl, templateName, templateData, NotificationStatus.FAILED, errorMessage);
            throw new Error(errorMessage);
        }

        // Create initial history record
        const history = await this.createHistoryRecord(webhookUrl, templateName, templateData, NotificationStatus.PENDING);

        try {
            // Render template
            const renderResult = await this.templateService.renderTemplateFromDatabase(templateName, templateData);

            if (!renderResult.success || !renderResult.rendered) {
                const errorMessage = `Template rendering failed: ${renderResult.error}`;
                this.logger.error(errorMessage, { templateName, templateData });
                await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
                throw new Error(errorMessage);
            }

            // Parse rendered template as JSON
            let payload: DiscordWebhookPayload;
            try {
                payload = JSON.parse(renderResult.rendered);
            } catch (error) {
                const errorMessage = `Invalid JSON in rendered template: ${error.message}`;
                this.logger.error(errorMessage, { rendered: renderResult.rendered });
                await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
                throw new Error(errorMessage);
            }

            // Apply optional overrides
            if (options.username) {
                payload.username = options.username;
            }
            if (options.avatarUrl) {
                payload.avatar_url = options.avatarUrl;
            }

            // Validate payload structure
            if (!payload.content && !payload.embeds?.length) {
                const errorMessage = 'Discord payload must contain either content or embeds';
                this.logger.error(errorMessage, { payload });
                await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
                throw new Error(errorMessage);
            }

            // Send webhook with retry logic
            await this.sendWebhookWithRetry(webhookUrl, payload);

            // Update history as successful
            await this.updateHistoryRecord(history, NotificationStatus.SENT);

            this.logger.log(`Discord notification sent successfully to ${webhookUrl}`, {
                templateName,
                hasEmbeds: !!payload.embeds?.length,
                hasContent: !!payload.content,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send Discord notification: ${errorMessage}`, {
                webhookUrl,
                templateName,
                error,
            });

            await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
            throw error;
        }
    }

    /**
     * Send simple text message to Discord webhook
     */
    public async sendSimpleMessage(webhookUrl: string, content: string, options: {
        username?: string;
        avatarUrl?: string;
    } = {}): Promise<void> {
        if (!this.validateWebhookUrl(webhookUrl)) {
            const errorMessage = `Invalid Discord webhook URL: ${webhookUrl}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        const payload: DiscordWebhookPayload = {
            content,
            username: options.username,
            avatar_url: options.avatarUrl,
        };

        try {
            await this.sendWebhookWithRetry(webhookUrl, payload);
            this.logger.log(`Simple Discord message sent successfully to ${webhookUrl}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send simple Discord message: ${errorMessage}`, {
                webhookUrl,
                error,
            });
            throw error;
        }
    }

    /**
     * Get rate limit information for a webhook
     */
    public getRateLimitInfo(webhookUrl: string): DiscordRateLimitInfo | undefined {
        const webhookId = this.getWebhookId(webhookUrl);
        return this.rateLimitMap.get(webhookId);
    }

    /**
     * Clear rate limit cache
     */
    public clearRateLimitCache(): void {
        this.rateLimitMap.clear();
        this.logger.log('Rate limit cache cleared');
    }

    /**
     * Get queue size for a webhook
     */
    public getQueueSize(webhookUrl: string): number {
        const webhookId = this.getWebhookId(webhookUrl);
        return this.webhookQueue.get(webhookId)?.length || 0;
    }
}