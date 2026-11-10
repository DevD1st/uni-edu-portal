import { DefaultNamingStrategy } from 'typeorm';

export class DatabaseNamingStrategy extends DefaultNamingStrategy {
  primaryKeyName(
    table: Parameters<DefaultNamingStrategy['primaryKeyName']>[0],
  ): string {
    return 'pk_' + this.getTableName(table).split('.').at(-1);
  }

  relationConstraintName(
    table: Parameters<DefaultNamingStrategy['relationConstraintName']>[0],
    columns: string[],
  ): string {
    return (
      'uq_' +
      this.getTableName(table).split('.').at(-1) +
      '_' +
      [...columns].sort().join('_')
    );
  }
}
