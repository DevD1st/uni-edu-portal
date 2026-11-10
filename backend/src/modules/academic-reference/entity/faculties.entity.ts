import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { Semester } from '#modules/academic-reference/entity/semesters.entity.js';

@Entity('faculties')
@Check('chk_faculties_status', "\"status\" IN ('active', 'inactive')")
@Check('chk_faculties_short_id_positive', '"short_id" > 0')
@Unique('uq_faculties_short_id', ['shortId'])
@Index('uq_faculties_normalized_name', { synchronize: false })
export class Faculty extends MutableRecord {
  /** Names the faculty in the university directory. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'inactive';

  /** Selects the current registration term for the faculty. */
  @Column({ name: 'current_semester_id', type: 'uuid', nullable: true })
  currentSemesterId!: string | null;

  @ManyToOne('Semester', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'current_semester_id',
    foreignKeyConstraintName: 'fk_faculties_current_semester_id',
  })
  currentSemester?: Semester | null;

  /** Supplies the faculty segment of a matriculation number. */
  @Column({
    name: 'short_id',
    type: 'integer',
    update: false,
    generated: 'identity',
    insert: false,
  })
  shortId!: number;
}
