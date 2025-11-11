import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, Method } from 'axios';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationHistoryRepository } from '../../db/notification/notification_history.repository';
import { UserNotificationPreferenceRepository } from '../../db/notification/user_notification_preference.repository';
import { NotificationChannel, NotificationStatus } from '../../db/notification/notification.types';
import { NotificationHistoryEntity } from '../../db/notification/notification_history.entity';

export interface WebhookRequestConfig {
    method?: Method;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    timeout?: number;
}

export interface WebhookPayload {
    [key: string]: any;
}

export interface WebhookResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
}

@Injectable()
export class WebhookNotificationService {
    private readonly logger = new Logger(WebhookNotificationService.name);
    private readonly httpClient: AxiosInstance;
    private readonly MAX_RETRIES = 3;
    private readonly BASE_DELAY = 1000;

    constructor(
        private readonly templateService: NotificationTemplateService,
        private readonly historyRepository: NotificationHistoryRepository,
        private readonly preferenceRepository: UserNotificationPreferenceRepository,
    ) {
        this.httpClient = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': 'SprocketBot/1.0',
            },
        });

        // Add response interceptor for logging
        this.httpClient.interceptors.response.use(
            (response) => {
                this.logger.debug(`Webhook response: ${response.status} ${response.statusText}`);
                return response;
            },
            (error: AxiosError) => {
                if (error.response) {
                    this.logger.warn(`Webhook error response: ${error.response.status} ${error.response.statusText}`);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Validate webhook URL format
     */
    private validateWebhookUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            // Accept HTTP and HTTPS URLs
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate payload based on content type
     */
    private validatePayload(payload: any, contentType: string): boolean {
        if (!payload) return false;

        switch (contentType) {
            case 'application/json':
                try {
                    JSON.stringify(payload);
                    return true;
                } catch (error) {
                    return false;
                }
            case 'application/x-www-form-urlencoded':
                return typeof payload === 'object' && Object.keys(payload).length > 0;
            case 'application/xml':
            case 'text/xml':
                // Allow either string XML or object with xml property
                return (typeof payload === 'string' && payload.length > 0) ||
                    (typeof payload === 'object' && payload.xml && typeof payload.xml === 'string');
            default:
                return true;
        }
    }

    /**
     * Send webhook with exponential backoff retry
     */
    private async sendWebhookWithRetry(
        webhookUrl: string,
        config: WebhookRequestConfig,
        payload: WebhookPayload,
        retryCount = 0
    ): Promise<WebhookResponse> {
        try {
            const requestConfig: AxiosRequestConfig = {
                method: config.method || 'POST',
                url: webhookUrl,
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers,
                },
                params: config.queryParams,
                timeout: config.timeout || 10000,
            };

            // Add payload based on method
            if (['POST', 'PUT', 'PATCH'].includes(requestConfig.method!.toUpperCase())) {
                requestConfig.data = payload;
            } else if (config.queryParams) {
                // For GET, DELETE, etc., add payload as query params
                requestConfig.params = { ...config.queryParams, ...payload };
            }

            const response = await this.httpClient.request(requestConfig);

            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as Record<string, string>,
                data: response.data,
            };

        } catch (error) {
            const axiosError = error as AxiosError;

            // Don't retry on client errors (4xx) except 429
            if (axiosError.response?.status &&
                axiosError.response.status >= 400 &&
                axiosError.response.status < 500 &&
                axiosError.response.status !== 429) {
                throw error;
            }

            if (retryCount < this.MAX_RETRIES) {
                const delay = Math.pow(2, retryCount) * this.BASE_DELAY;
                this.logger.warn(`Webhook failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`, {
                    error: axiosError.message,
                    status: axiosError.response?.status,
                    webhookUrl,
                });

                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendWebhookWithRetry(webhookUrl, config, payload, retryCount + 1);
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
            channel: NotificationChannel.WEBHOOK,
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
     * Send notification to webhook
     */
    public async sendNotification(
        webhookUrl: string,
        templateName: string,
        templateData: Record<string, any>,
        requestConfig: WebhookRequestConfig = {},
    ): Promise<WebhookResponse> {
        // Validate webhook URL
        if (!this.validateWebhookUrl(webhookUrl)) {
            const errorMessage = `Invalid webhook URL: ${webhookUrl}`;
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

            // Parse rendered template
            let payload: WebhookPayload;
            let contentType = 'application/json';

            try {
                // Try to parse as JSON first
                payload = JSON.parse(renderResult.rendered);
                contentType = 'application/json';
            } catch (error) {
                // If not JSON, treat as plain text or XML
                const rendered = renderResult.rendered.trim();
                if (rendered.startsWith('<?xml') || rendered.startsWith('<')) {
                    // For XML, wrap in an object with the XML string
                    payload = { xml: rendered };
                    contentType = 'application/xml';
                } else if (rendered.includes('=') && !rendered.includes('{') && !rendered.includes('<')) {
                    // Simple form data format: key1=value1&key2=value2
                    const params = new URLSearchParams();
                    rendered.split('&').forEach(pair => {
                        const [key, value] = pair.split('=');
                        if (key && value) {
                            params.append(decodeURIComponent(key), decodeURIComponent(value));
                        }
                    });
                    payload = Object.fromEntries(params);
                    contentType = 'application/x-www-form-urlencoded';
                } else {
                    payload = { content: rendered };
                    contentType = 'application/json';
                }
            }

            // Validate payload
            if (!this.validatePayload(payload, contentType)) {
                const errorMessage = `Invalid payload for content type ${contentType}`;
                this.logger.error(errorMessage, { payload });
                await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
                throw new Error(errorMessage);
            }

            // Set content type in headers
            const finalConfig: WebhookRequestConfig = {
                ...requestConfig,
                headers: {
                    'Content-Type': contentType,
                    ...requestConfig.headers,
                },
            };

            // Send webhook with retry logic
            const response = await this.sendWebhookWithRetry(webhookUrl, finalConfig, payload);

            // Update history as successful
            await this.updateHistoryRecord(history, NotificationStatus.SENT);

            this.logger.log(`Webhook notification sent successfully to ${webhookUrl}`, {
                templateName,
                status: response.status,
                contentType,
            });

            return response;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send webhook notification: ${errorMessage}`, {
                webhookUrl,
                templateName,
                error,
            });

            await this.updateHistoryRecord(history, NotificationStatus.FAILED, errorMessage);
            throw error;
        }
    }

    /**
     * Send simple payload to webhook
     */
    public async sendSimplePayload(
        webhookUrl: string,
        payload: WebhookPayload,
        requestConfig: WebhookRequestConfig = {},
    ): Promise<WebhookResponse> {
        if (!this.validateWebhookUrl(webhookUrl)) {
            const errorMessage = `Invalid webhook URL: ${webhookUrl}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const response = await this.sendWebhookWithRetry(webhookUrl, requestConfig, payload);
            this.logger.log(`Simple webhook payload sent successfully to ${webhookUrl}`, {
                status: response.status,
            });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send simple webhook payload: ${errorMessage}`, {
                webhookUrl,
                error,
            });
            throw error;
        }
    }

    /**
     * Test webhook endpoint
     */
    public async testWebhook(webhookUrl: string, requestConfig: WebhookRequestConfig = {}): Promise<WebhookResponse> {
        if (!this.validateWebhookUrl(webhookUrl)) {
            const errorMessage = `Invalid webhook URL: ${webhookUrl}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        const testPayload = {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'Webhook test from Sprocket',
        };

        try {
            const response = await this.sendWebhookWithRetry(
                webhookUrl,
                {
                    ...requestConfig,
                    method: requestConfig.method || 'POST',
                },
                testPayload
            );

            this.logger.log(`Webhook test successful for ${webhookUrl}`, {
                status: response.status,
                statusText: response.statusText,
            });

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Webhook test failed for ${webhookUrl}: ${errorMessage}`, {
                error,
            });
            throw error;
        }
    }
}