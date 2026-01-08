import { IsString, IsDateString, Matches, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsOptional()
  street?: string;
  @IsOptional()
  suburb?: string;
  @IsOptional()
  city?: string;
  @IsOptional()
  province?: string;
  @IsOptional()
  postalCode?: string;
  @IsOptional()
  country?: string;
}

export class EmergencyContactDto {
  @IsString() name: string;
  @IsString() relationship: string;
  @IsString() phone: string;
}

export class CreatePatientDto {
  @IsString() firstName: string;
  @IsString() lastName: string;

  @IsString()
  @Matches(/^\d{13}$/, { message: 'SA ID must be 13 digits' })
  idNumber: string;

  @IsDateString() dateOfBirth: string;

  @IsOptional()
  @IsEnum(['male','female','other'])
  gender?: string;

  @IsString() phoneNumber: string;

  @IsOptional()
  @IsString() email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  medicalAid?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts: EmergencyContactDto[];

  @IsOptional()
  relationshipToMain?: string;

  @IsString()
  otpChannel: 'sms' | 'email';
}
