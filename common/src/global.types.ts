export enum CommonClient {
  Bot = 'CommonClientBot',
  Analytics = 'CommonClientAnalytics',
  Matchmaking = 'CommonClientMatchmaking',
  ImageGeneration = 'CommonImageGeneration',
  Notification = 'CommonClientNotification',
  Core = 'CommonClientCore',
  Submission = 'CommonClientSubmission',
}

export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface MicroserviceRequestOptions {
  timeout?: number;
}
