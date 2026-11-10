import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

export abstract class IdentifiedRecord {
  /** Stable UUIDv7 used for relations and internal history. */
  @PrimaryColumn('uuid', { name: 'id' })
  id: string = uuidv7();
}

export abstract class CreatedRecord extends IdentifiedRecord {
  /** Time at which this record was first written. */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

export abstract class MutableRecord extends CreatedRecord {
  /** Time of the most recent write to this record. */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
