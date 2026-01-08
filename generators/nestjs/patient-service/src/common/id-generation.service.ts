import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * IdGenerationService: generates patientNumber PT{YYYY}{NNNNN}
 * Uses transactional row in patient_numbers table.
 */
@Injectable()
export class IdGenerationService {
  constructor(private dataSource: DataSource) {}

  async generatePatientNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const res = await queryRunner.query('SELECT last_seq FROM patient_numbers WHERE year = $1 FOR UPDATE', [year]);
      let next = 1;
      if (res.length === 0) {
        await queryRunner.query('INSERT INTO patient_numbers(year,last_seq) VALUES($1,$2)', [year, 1]);
        next = 1;
      } else {
        next = parseInt(res[0].last_seq, 10) + 1;
        await queryRunner.query('UPDATE patient_numbers SET last_seq = $1 WHERE year = $2', [next, year]);
      }
      await queryRunner.commitTransaction();
      return `PT${year}${String(next).padStart(5, '0')}`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
