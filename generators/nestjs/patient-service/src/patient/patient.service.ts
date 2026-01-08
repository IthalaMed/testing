import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { EncryptionService } from '../common/encryption.service';
import { EventBus } from '../common/event-bus';
import { IdGenerationService } from '../common/id-generation.service';
import { AuditService } from '../common/audit.service';
import * as crypto from 'crypto';

/**
 * Business logic for Patient Registration and profile management.
 * - Luhn SA ID validation done earlier at controller but double-check here
 * - Encryption of idNumber
 * - idNumberHash duplicate detection
 * - patientNumber generation via IdGenerationService
 */
@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    private encryption: EncryptionService,
    private eventBus: EventBus,
    private idGen: IdGenerationService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  private validateSAId(id: string): boolean {
    if (!/^\d{13}$/.test(id)) return false;
    const digits = id.split('').map(Number);
    const checksum = digits.pop()!;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = digits[i];
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    const calc = (10 - (sum % 10)) % 10;
    return calc === checksum;
  }

  private computeIdHash(id: string): string {
    const normalized = id.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  async startRegistration(dto: CreatePatientDto) {
    // Validate SA ID if provided
    if (dto.idNumber && !this.validateSAId(dto.idNumber)) {
      throw new BadRequestException('Invalid SA ID number');
    }
    // Create temp registration (should be stored encrypted in real implementation)
    // For simplicity we'll return a generated tempId and expect verifyOtp to be called.
    const tempId = crypto.randomUUID();
    // In production: persist to temp_registrations table with expiry & OTP
    // Here we return tempId and expect client to call verify-otp with OTP from test harness
    await this.auditService.log({ action: 'START_REGISTRATION', metadata: { tempId, phone: dto.phoneNumber }});
    return { tempRegistrationId: tempId, message: 'OTP sent (simulated)' };
  }

  async finalizeRegistration(tempPayload: {
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: string;
    phoneNumber: string;
    email?: string;
    address?: any;
    medicalAid?: any;
    emergencyContacts?: any[];
  }) {
    // compute id hash
    const idHash = this.computeIdHash(tempPayload.idNumber);

    // duplicate check
    const existing = await this.patientRepo.findOne({ where: [{ idNumberHash: idHash }, { phoneNumber: tempPayload.phoneNumber }] });
    if (existing) {
      throw new ConflictException({ message: 'Patient already exists', patientId: existing.id });
    }

    // generate patient number transactionally
    const patientNumber = await this.idGen.generatePatientNumber();

    // encrypt id
    const encryptedId = await this.encryption.encrypt(tempPayload.idNumber);

    // create entity
    const patient = this.patientRepo.create({
      patientNumber,
      firstName: tempPayload.firstName,
      lastName: tempPayload.lastName,
      idNumber: encryptedId,
      idNumberHash: idHash,
      dateOfBirth: tempPayload.dateOfBirth,
      phoneNumber: tempPayload.phoneNumber,
      email: tempPayload.email,
      address: tempPayload.address,
      medicalAid: tempPayload.medicalAid,
      emergencyContacts: tempPayload.emergencyContacts,
      status: 'active'
    });

    const saved = await this.patientRepo.save(patient);
    await this.eventBus.publish('patient.registered', { patientId: saved.id });
    await this.auditService.log({ userId: saved.id, action: 'PATIENT_REGISTERED', resource: 'patient', resourceId: saved.id });
    // redact idNumber in response
    const resp: any = { ...saved } as any;
    delete resp.idNumber;
    delete resp.idNumberHash;
    return resp;
  }

  async findById(id: string) {
    const p = await this.patientRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Patient not found');
    const copy: any = { ...p };
    delete copy.idNumber;
    delete copy.idNumberHash;
    return copy;
  }

  async updateProfile(id: string, changes: Partial<CreatePatientDto>) {
    // allow patch updates; if idNumber updated, revalidate/encrypt
    if (changes.idNumber) {
      if (!this.validateSAId(changes.idNumber)) throw new BadRequestException('Invalid SA ID number');
      changes['idNumber'] = changes.idNumber;
      const encrypted = await this.encryption.encrypt(changes.idNumber);
      // compute hash
      (changes as any).idNumberHash = this.computeIdHash(changes.idNumber);
      (changes as any).idNumber = encrypted as any;
    }
    await this.patientRepo.update(id, changes as any);
    await this.auditService.log({ userId: id, action: 'PATIENT_UPDATED', resource: 'patient', resourceId: id, metadata: changes });
    return this.findById(id);
  }
}
