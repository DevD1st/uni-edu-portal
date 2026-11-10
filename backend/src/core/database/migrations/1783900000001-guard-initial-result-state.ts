import type { MigrationInterface, QueryRunner } from 'typeorm';

export class GuardInitialResultState1783900000001
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // The existing update guards assume that each roster starts open and unpublished.
    await queryRunner.query(`
      CREATE FUNCTION uemp_guard_initial_result_group() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.status <> 'pending' OR NEW.registration_status <> 'opened' THEN
          RAISE EXCEPTION 'New result groups must start pending with registration open' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
      END
      $$;
      CREATE TRIGGER result_groups_guard_insert BEFORE INSERT ON result_groups
        FOR EACH ROW EXECUTE FUNCTION uemp_guard_initial_result_group();
    `);

    // Registration creates an enrollment. Approval assigns its grade later.
    await queryRunner.query(`
      CREATE FUNCTION uemp_guard_initial_enrollment() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.awarded_grade_system_id IS NOT NULL THEN
          RAISE EXCEPTION 'New enrollments cannot have an awarded grade' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
      END
      $$;
      CREATE TRIGGER student_courses_guard_initial_award BEFORE INSERT ON student_registered_courses
        FOR EACH ROW EXECUTE FUNCTION uemp_guard_initial_enrollment();
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER student_courses_guard_initial_award ON student_registered_courses;
      DROP FUNCTION uemp_guard_initial_enrollment();
      DROP TRIGGER result_groups_guard_insert ON result_groups;
      DROP FUNCTION uemp_guard_initial_result_group();
    `);
  }
}
