import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
  Logger,
} from '@nestjs/common';
import type { Request as Req } from 'express';
import { AppService } from './app.service';
import { AuthZManagementService } from 'nest-authz';
import { AuthorizeGuard } from './auth/authorize/authorize.guard';
import { AuthTarget, AuthScope, AuthAction } from '@sprocketbot/lib/types';
import { GuidService, RedLock, RedisJsonService } from '@sprocketbot/lib';
import { MatchmakingService } from '@sprocketbot/matchmaking';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly authManageService: AuthZManagementService,
    private readonly matchmaking: MatchmakingService,
    private readonly redisJsonService: RedisJsonService,
    private readonly guidService: GuidService,
  ) {}

  @Get()
  @RedLock([
    'x',
    function (r) {
      return this.appService.getHello();
    },
  ])
  async getHello(
    @Request() req: Req,
    @Query('throw') shouldError: string,
  ): Promise<string> {
    const before = performance.now();
    await new Promise((r) => setTimeout(r, Math.random() * 1000));
    const after = performance.now();
    const message = `Took ${(after - before).toFixed(2)}ms`;
    const opGuid = this.guidService.getId();
    await this.redisJsonService.SET(opGuid, '.', { hi: 'Hello World' });
    await this.redisJsonService.MSET([opGuid, '.one', 1], [opGuid, '.two', 2]);

    this.logger.debug(await this.redisJsonService.GET(opGuid, '$'));
    this.logger.debug(await this.redisJsonService.GET(opGuid, '$'));
    if (shouldError === 'true') {
      throw new Error(message);
    }
    return message;
  }

  @Get('/service')
  async callMatchmaking(): Promise<string> {
    console.log('Starting');
    return this.matchmaking.test();
  }

  @Get('/authenticated')
  @UseGuards(AuthorizeGuard())
  getAuthed(): string {
    return 'Hello Authenticated User!';
  }

  @Get('/debug-auth')
  async debugAuth(): Promise<any> {
    return {
      allActions: await this.authManageService.getAllActions(),
      allPolicies: await this.authManageService.getPolicy(),
      allRoles: await this.authManageService.getAllRoles(),
      allObjects: await this.authManageService.getAllObjects(),
      allSubjects: await this.authManageService.getAllSubjects(),
      allGroups: await this.authManageService.getGroupingPolicy(),
    };
  }

  @Get('/authorized/:username')
  @RedLock([(username) => username, 'authorized'])
  @UseGuards(
    AuthorizeGuard({
      target: AuthTarget.USER,
      action: AuthAction.Read,
      scope: AuthScope.SELF,
      inScope: (user, req) => req.params.username === user.username,
    }),
  )
  async getAuthorized(@Param('username') username: string): Promise<string> {
    return username;
  }
}
