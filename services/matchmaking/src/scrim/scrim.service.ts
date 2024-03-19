import { Injectable } from '@nestjs/common';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';

@Injectable()
export class ScrimService {
  constructor(private readonly scrimCrudService: ScrimCrudService) {}
  async createScrim(authorId: string) {}
}
