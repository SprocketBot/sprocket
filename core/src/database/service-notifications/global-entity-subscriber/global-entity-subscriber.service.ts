/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/typeorm';
import type { EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { Connection, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class GlobalEntitySubscriberService implements EntitySubscriberInterface<unknown> {
  private logger = new Logger(GlobalEntitySubscriberService.name);

  constructor(
    @InjectConnection() connection: Connection,
    @Inject('Client') protected clientProxy: ClientProxy,
  ) {
    connection.subscribers.push(this);
    this.logger.verbose('GlobalEntitySubscriber Initialized');
  }

  /**
   * Helper to safely sanitize entities with circular references
   */
  private sanitize(entity: any): any {
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(entity, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }),
    );
  }

  /**
   * Called after entity insertion. Emits a message to the entire ecosystem of microservices containing the entity that was inserted.
   */
  afterInsert(event: InsertEvent<unknown>): void {
    this.logger.verbose(`db.inserted.${event.metadata.name}`);
    this.clientProxy.emit(`db.inserted.${event.metadata.name}`, this.sanitize(event.entity));
  }

  /**
   * Called after entity update. Emits a message to the entire ecosystem of microservices containing the entity after update and the columns that were updated.
   */
  beforeUpdate(event: UpdateEvent<unknown>): void {
    const payload = {
      dbEntity: this.sanitize(event.databaseEntity),
      entity: this.sanitize(event.entity),
      updatedColumns: event.updatedColumns.map(uc => uc.databaseName),
    };
    this.logger.verbose(`db.updated.${event.metadata.name}`);
    this.clientProxy.emit(`db.updated.${event.metadata.name}`, payload);
  }

  /**
   * Called after entity removal. Emits a message to the entire ecosystem of microservices containining the entity that was removed.
   */
  afterRemove(event: RemoveEvent<unknown>): void {
    this.logger.verbose(`db.removed.${event.metadata.name}`);
    this.clientProxy.emit(`db.removed.${event.metadata.name}`, this.sanitize(event.entity));
  }
}
