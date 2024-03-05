import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthZManagementService, AuthZRBACService } from 'nest-authz';
import { LoggedInGuard } from './auth/logged-in/logged-in.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthorizeGuard } from './auth/authorize/authorize.guard';
import { Authorize } from './auth/authorize/authorize.decorator';
import { AuthAction, AuthScope, AuthTarget } from './auth/constants';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
    private readonly authzService: AuthZRBACService,
    private readonly authManageService: AuthZManagementService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/authenticated')
  @UseGuards(LoggedInGuard)
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
  @UseGuards(LoggedInGuard, AuthorizeGuard)
  @Authorize({
    target: AuthTarget.USER,
    action: AuthAction.READ,
    scope: AuthScope.SELF,
    inScope: (user, req) => req.params.username === user.username,
  })
  async getAuthorized(@Param('username') username: string): Promise<string> {
    return username;
  }
}
