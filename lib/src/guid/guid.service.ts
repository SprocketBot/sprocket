import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
@Injectable()
export class GuidService {
  getId(): string {
    return nanoid();
  }
}
