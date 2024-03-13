import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseSprocketModules } from '@sprocketbot/lib';

@Module({
  imports: [...BaseSprocketModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
