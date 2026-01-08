import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(private dataSource: DataSource) {}

  async log(event: {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    metadata?: any;
  }) {
    const now = new Date();
    await this.dataSource.query(
      `INSERT INTO audit_logs(id, event_time, user_id, action, resource_type, resource_id, ip_address, user_agent, success, metadata)
       VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        now,
        event.userId || null,
        event.action,
        event.resource || null,
        event.resourceId || null,
        event.ipAddress || null,
        event.userAgent || null,
        event.success === undefined ? true : event.success,
        event.metadata ? JSON.stringify(event.metadata) : null,
      ],
    );
  }
}
