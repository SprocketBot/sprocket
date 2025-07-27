import { Injectable, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import type { Channel, Connection, ConsumeMessage } from 'amqplib';
import { connect } from 'amqplib';
import { SprocketConfigService } from '../config-module';
import { GuidService } from '../guid/guid.service';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  private readonly exchangeKey = 'SprocketEvents';

  private channel: Channel;

  private connection: Connection;

  get conn(): Connection {
    return this.connection;
  }

  constructor(
    private readonly config: SprocketConfigService,
    private readonly guidService: GuidService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const rmqUrl = this.config.getOrThrow('amqp.url');
    // Remove authentication information from the URL
    const displayUrl = new URL(rmqUrl);
    displayUrl.username = '';
    displayUrl.password = '';
    // Create a connection to RabbitMQ
    try {
      this.connection = await connect(rmqUrl, { heartbeat: 120 });
      // Create a channel (?)
      await this.buildChannel();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * Non-Typesafe Publish function, implements the bare interactions with AMQP
   * @param topic {string} Topic to put to (i.e. scrim.complete)
   * @param data {Buffer} Buffer of some JSON artifact (object, array, int, etc)
   * @returns {boolean} Success of message publication
   */
  async pub(topic: string, data: Buffer): Promise<boolean> {
    this.logger.debug(`Publishing to ${this.exchangeKey}-[${topic}]-> ?`);
    // Publish to our exchange, the data, filtering consumers based on topic.
    return this.channel.publish(this.exchangeKey, topic, data, {
      appId: this.config.get('service.name'),
      messageId: this.guidService.getShortId(),
    });
  }

  /**
   * Non-Typesafe Subscription function, implements the bare interactions with AMQP
   * @param topic {string} Topic to sub to (i.e. scrim.complete)
   * @param instanceExclusive {boolean} Identifies if the subscription should be created at an application or instance level
   * @returns {Observable<ConsumeMessage>} An observable that will complete when the subscription is destroyed
   */
  async sub(
    topic: string,
    instanceExclusive: boolean,
  ): Promise<Observable<ConsumeMessage>> {
    /*
     * Build some application scoped queue name
     * If this is used, then the application (i.e. sprocket-core) as a whole should receive each event once
     */
    let queue = `${this.exchangeKey}-${topic}-${this.config.getOrThrow('service.name')}`;

    /*
     * If we want to subscribe in an instance scoped (i.e. each sprocket-core gets it) way,
     * we need to use a different queue name
     */
    if (instanceExclusive) {
      /*
       * Create some non-durable (i.e. dies when the consumer dies), exclusive queue (i.e. nobody else can consume from this)
       * By providing a blank queue name, RabbitMQ will assign us one
       */
      const queueResponse = await this.channel.assertQueue('', {
        durable: false,
        exclusive: true,
      });
      queue = queueResponse.queue;
    } else {
      // Use our generated, application-scoped
      await this.channel.assertQueue(queue, {
        durable: false,
        exclusive: false,
      });
    }
    /*
     * Bind our new queue to the exchange, based on the specified topic
     * This will allow messages matching the topic to enter our queue
     */
    await this.channel.bindQueue(queue, this.exchangeKey, topic);
    this.logger.debug(
      `Creating events subscription ${this.exchangeKey}-[${topic}]->${queue}`,
    );

    const output = new Observable<ConsumeMessage>((sub) => {
      // Consume messages from our queue, into an observable
      this.channel
        .consume(
          queue,
          (v: null | ConsumeMessage) => {
            // RabbitMQ provides null if the consumer is destroyed from the server-side
            if (v === null) {
              this.logger.debug(
                `Events subscription ${this.exchangeKey}-[${topic}]->${queue} has been destroyed`,
              );
              sub.complete();
              return;
            }
            sub.next(v);
          },
          {
            /*
             * Allow local events to be consumed (i.e. within the same service)
             * Disallowing this could lead to weird behavior, especially for multi-instanced services
             */
            noLocal: false,
            /*
             * Acknowledge a message upon receipt, because there is no expectation of response, this should be okay
             */
            noAck: true,
          },
        )
        .catch(sub.error.bind(sub));
      return (): void => {
        this.logger.debug(
          `Destroying events subscription ${this.exchangeKey}-[${topic}]->${queue}`,
        );
        this.channel.deleteQueue(queue).catch(sub.error.bind(sub));
      };
    });

    output.pipe(
      tap((v) => {
        this.logger.debug(v);
      }),
    );
    return output;
  }

  private buildChannel = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.channel) {
      // If we already have a channel, go ahead and close it
      this.channel.removeAllListeners();
      await this.channel.close();
    }
    this.channel = await this.connection.createChannel();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.channel.on('closed', async () =>
      this.buildChannel().catch(this.logger.error.bind(this.logger)),
    );
    /*
     * Assert that our exchange exists, and meets the specification we are expecting
     * If it does not exist, this creates it
     */
    await this.channel.assertExchange(this.exchangeKey, 'topic', {
      durable: false,
    });
  };
}
