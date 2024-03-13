import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigService } from '@sprocketbot/lib';
import { MetaService } from './meta/meta.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [SprocketConfigService],
      useClass: TypeormBootstrapService,
    }),
  ],
  providers: [MetaService],
  exports: [MetaService],
})
export class DbModule {}
