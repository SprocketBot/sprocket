import { Inject, Injectable } from '@nestjs/common';
import { MatchmakingName } from './constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatchmakingService {
  constructor(@Inject(MatchmakingName) private client: ClientProxy) {
    const oldSend = client.send;
    client.send = (pattern, data) => {
      return oldSend.bind(client)(pattern, {
        ...data,
      });
    };
  }

  async test() {
    const result = await firstValueFrom(this.client.send('test', {}));

    return result;
  }
}
