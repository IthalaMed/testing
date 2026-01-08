import { Injectable } from '@nestjs/common';

type Handler = (payload: any) => Promise<void> | void;

/**
 * Lightweight in-process EventBus. Replace with RabbitMQ/Kafka in prod.
 */
@Injectable()
export class EventBus {
  private handlers: Record<string, Handler[]> = {};

  subscribe(event: string, handler: Handler) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }

  async publish(event: string, payload: any) {
    const handlers = this.handlers[event] || [];
    for (const h of handlers) {
      try {
        await h(payload);
      } catch (e) {
        console.error('Event handler error', e);
      }
    }
  }
}
