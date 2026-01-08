import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  patientNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'bytea' })
  idNumber: Buffer; // encrypted payload

  @Column({ type: 'char', length: 64, nullable: true })
  idNumberHash?: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: any;

  @Column({ type: 'jsonb', nullable: true })
  medicalAid?: any;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts?: any;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
