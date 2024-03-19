import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseSprocketModules } from '@sprocketbot/lib';
import { ScrimService } from './scrim/scrim.service';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';

@Module({
  imports: [...BaseSprocketModules],
  controllers: [AppController],
  providers: [AppService, ScrimService, ScrimCrudService],
})
export class AppModule {}
