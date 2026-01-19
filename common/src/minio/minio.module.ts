import { Module } from '@nestjs/common';

import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
