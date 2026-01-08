import { z } from 'zod';

export const EmergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
});

export const PatientRegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  idNumber: z.string().regex(/^\d{13}$/, 'SA ID must be 13 digits'),
  dateOfBirth: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phoneNumber: z.string().min(8),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string().optional().nullable(),
    suburb: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }).optional(),
  medicalAid: z.any().optional(),
  emergencyContacts: z.array(EmergencyContactSchema).min(1),
  relationshipToMain: z.enum(['self', 'dependent']).optional(),
  otpChannel: z.enum(['sms', 'email']),
});

export type PatientRegisterDto = z.infer<typeof PatientRegisterSchema>;
