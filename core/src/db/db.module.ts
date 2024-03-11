import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigModule } from '@sprocketbot/lib';
import { MetaService } from './meta/meta.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SprocketConfigModule],
      useClass: TypeormBootstrapService,
    }),
  ],
  providers: [MetaService],
  exports: [MetaService],
})
export class DbModule {}
