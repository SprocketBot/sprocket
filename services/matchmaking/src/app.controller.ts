import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { RedLock } from '@sprocketbot/lib';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('test')
  @RedLock(['test-lock'])
  getHello(): string {
    return this.appService.getHello();
  }
}
