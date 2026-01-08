-- Migration: create patients, patient_numbers and audit_logs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE patient_numbers (
  year integer PRIMARY KEY,
  last_seq integer NOT NULL
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  id_number BYTEA NOT NULL,
  id_number_hash CHAR(64),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  phone_number VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255),
  address JSONB,
  medical_aid JSONB,
  emergency_contacts JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE UNIQUE INDEX idx_patients_patient_number ON patients(patient_number);
CREATE UNIQUE INDEX idx_patients_phone ON patients(phone_number);
CREATE UNIQUE INDEX idx_patients_idnumber_hash ON patients(id_number_hash);
CREATE INDEX idx_patients_created_at ON patients(created_at);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID,
  action VARCHAR(128),
  resource_type VARCHAR(64),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN,
  metadata JSONB
);

-- Temp registrations (OTP flows)
CREATE TABLE temp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  otp VARCHAR(8) NOT NULL,
  channel VARCHAR(10) NOT NULL,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Preliminary patient_numbers seed for current year
INSERT INTO patient_numbers(year, last_seq) VALUES (EXTRACT(YEAR FROM now())::int, 0)
ON CONFLICT (year) DO NOTHING;
