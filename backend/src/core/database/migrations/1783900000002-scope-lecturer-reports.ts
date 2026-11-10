import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeLecturerReports1783900000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Lecturer summaries already require an offering assignment. The new department reports
    // are a separate privilege, so teaching alone must not grant access to them.
    await queryRunner.query(`
      UPDATE roles SET privileges = array_remove(privileges, 'read_reports'), updated_at = now()
      WHERE system_key = 'lecturer'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles SET privileges = array_append(privileges, 'read_reports'), updated_at = now()
      WHERE system_key = 'lecturer' AND NOT ('read_reports' = ANY(privileges))
    `);
  }
}
