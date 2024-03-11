import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TableListing {
  schemaname: string;
  tablename: string;
  tableowner: string;
  tablespace: string | null;
  hasindexes: boolean;
  hasrules: boolean;
  hastriggers: boolean;
  rowsecurity: boolean;
}

@Injectable()
export class MetaService {
  constructor(private readonly dataSource: DataSource) {}

  async listTables(): Promise<TableListing[]> {
    const result = await this.dataSource.query(`
        SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog' AND 
    schemaname != 'information_schema';`);
    return result;
  }
}
