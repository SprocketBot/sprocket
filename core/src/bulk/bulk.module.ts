import { Module } from '@nestjs/common';
import { BulkService } from './bulk.service';
import { DataService } from './data.service';
import { DbModule } from '../db/db.module';

@Module({
    imports: [DbModule],
    providers: [BulkService, DataService],
    exports: [BulkService, DataService],
})
export class BulkModule { }
