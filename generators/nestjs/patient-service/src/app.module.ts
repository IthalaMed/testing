import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientModule } from './patient/patient.module';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './common/encryption.service';
import { EventBus } from './common/event-bus';
import { IdGenerationService } from './common/id-generation.service';
import { AuditService } from './common/audit.service';
import { FacilityModule } from './facility/facility.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/ithalamed',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
    }),
    PatientModule,
    FacilityModule,
  ],
  providers: [EncryptionService, EventBus, IdGenerationService, AuditService],
})
export class AppModule {}
