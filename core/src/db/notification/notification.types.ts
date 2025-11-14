import { registerEnumType } from '@nestjs/graphql';

export enum NotificationChannel {
    EMAIL = 'EMAIL',
    PUSH = 'PUSH',
    SMS = 'SMS',
    IN_APP = 'IN_APP',
    DISCORD = 'DISCORD',
    WEBHOOK = 'WEBHOOK',
}

registerEnumType(NotificationChannel, {
    name: 'NotificationChannel',
});

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
    RETRYING = 'RETRYING',
}

registerEnumType(NotificationStatus, {
    name: 'NotificationStatus',
});