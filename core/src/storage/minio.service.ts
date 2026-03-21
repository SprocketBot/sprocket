import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { SprocketConfigService } from '@sprocketbot/lib';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly cfg: SprocketConfigService) {
    const endPoint = this.cfg.getOrThrow('minio.endPoint');
    const port = Number(this.cfg.getOrThrow('minio.port'));
    const accessKey = this.cfg.getOrThrow('minio.accessKey');
    const secretKey = this.cfg.getOrThrow('minio.secretKey');
    const useSSL =
      String(this.cfg.get('minio.useSSL') ?? 'false').toLowerCase() === 'true';

    this.bucket = this.cfg.getOrThrow('minio.bucket');
    this.client = new Client({
      endPoint,
      port,
      accessKey,
      secretKey,
      useSSL,
    });
  }

  async putObject(
    objectKey: string,
    data: Buffer,
    contentType?: string,
  ): Promise<void> {
    await this.client.putObject(
      this.bucket,
      objectKey,
      data,
      data.length,
      contentType ? { 'Content-Type': contentType } : undefined,
    );
  }

  async getObject(objectKey: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, objectKey);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
