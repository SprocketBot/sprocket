import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
@Injectable()
export class GuidService {
  getId(): string {
    return v4();
  }

  getShortId(): string {
    return v4().split('-')[0]!;
  }
}
