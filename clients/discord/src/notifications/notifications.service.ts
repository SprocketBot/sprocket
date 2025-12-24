import { Injectable, Logger } from '@nestjs/common';
import { Client, TextChannel } from 'discord.js';

export interface NotificationPayload {
  channelId: string;
  message: string;
  embed?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly client: Client) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const { channelId, message, embed } = payload;

    this.logger.log(`Sending notification to channel ${channelId}`);

    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !(channel instanceof TextChannel)) {
        this.logger.error(`Channel ${channelId} not found or is not a text channel`);
        throw new Error(`Channel ${channelId} not found or is not a text channel`);
      }

      await channel.send({
        content: message,
        embeds: embed ? [embed] : undefined,
      });

      this.logger.log(`Notification sent to ${channelId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}
