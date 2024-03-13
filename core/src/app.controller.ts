import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import type { Request as Req } from 'express';
import { AppService } from './app.service';
import { AuthZManagementService } from 'nest-authz';
import { AuthorizeGuard } from './auth/authorize/authorize.guard';
import { AuthTarget, AuthScope, AuthAction } from '@sprocketbot/lib/types';
import { RedLock } from '@sprocketbot/lib';
import { MatchmakingService } from '@sprocketbot/matchmaking';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authManageService: AuthZManagementService,
    private readonly matchmaking: MatchmakingService,
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
    console.log('Start');
    const before = performance.now();
    await new Promise((r) => setTimeout(r, Math.random() * 1000));
    const after = performance.now();
    const message = `Took ${(after - before).toFixed(2)}ms`;
    console.log('End');
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
