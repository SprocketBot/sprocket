import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthZManagementService } from 'nest-authz';
import { AuthorizeGuard } from './auth/authorize/authorize.guard';
import { AuthTarget, AuthScope, AuthAction } from '@sprocketbot/lib/types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authManageService: AuthZManagementService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
