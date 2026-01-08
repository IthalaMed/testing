import { Controller, Post, Body, Get, Param, Patch, BadRequestException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';

/**
 * Controller provides endpoints:
 * - POST /api/v1/patients/register
 * - POST /api/v1/patients/verify-otp
 * - GET /api/v1/patients/:id
 * - PATCH /api/v1/patients/:id
 *
 * OTP flows are simplified here: in production, OTP must be sent via Twilio/SendGrid and stored in temp_registrations.
 */
@Controller('patients')
export class PatientController {
  constructor(private readonly svc: PatientService) {}

  @Post('register')
  async register(@Body() dto: CreatePatientDto) {
    // start registration process (send OTP)
    return this.svc.startRegistration(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { tempRegistrationId: string, otp: string }) {
    // In a full implementation, look up tempRegistrationId and validate OTP.
    // For codegen starter: assume OTP valid and payload stored in memory in tests.
    // Here we'll simulate by expecting a payload provided in body.tempRegistrationId (for test harness)
    // For safety, require that the tempRegistrationId is present
    if (!body.tempRegistrationId) throw new BadRequestException('Missing tempRegistrationId');
    // In this stub, tempRegistrationId encodes JSON for ease of local testing (not production).
    // Production: fetch temp_registrations from DB.
    // Example test harness: pass serialized payload as tempRegistrationId to finalize.
    try {
      const payload = JSON.parse(Buffer.from(body.tempRegistrationId, 'base64').toString('utf8'));
      const patient = await this.svc.finalizeRegistration(payload);
      // Return patient + simulated token
      return { patient, accessToken: 'SIMULATED_TOKEN' };
    } catch (e) {
      throw new BadRequestException('Invalid tempRegistrationId or OTP');
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() changes: Partial<CreatePatientDto>) {
    return this.svc.updateProfile(id, changes);
  }
}
