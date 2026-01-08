import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { EncryptionService } from '../common/encryption.service';
import { EventBus } from '../common/event-bus';
import { IdGenerationService } from '../common/id-generation.service';
import { AuditService } from '../common/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  controllers: [PatientController],
  providers: [PatientService, EncryptionService, EventBus, IdGenerationService, AuditService],
  exports: [PatientService]
})
export class PatientModule {}
