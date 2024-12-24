import { Injectable, Logger } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { AuthZService } from 'nest-authz';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { SprocketConfigService } from '@sprocketbot/lib';

@Injectable()
@Seed()
export class PolicySeed implements Seeder {
  private readonly logger = new Logger(PolicySeed.name);
  constructor(
    private readonly authZService: AuthZService,
    private readonly config: SprocketConfigService,
  ) {}
  async seed() {
    // Give superuser access to everything
    (Object.keys(Resource) as Array<keyof typeof Resource>).map(
      async (resource) => {
        (Object.keys(ResourceAction) as Array<keyof typeof ResourceAction>).map(
          async (action) => {
            this.ensurePerm('superuser', resource, action + ':any');
          },
        );
      },
    );

    // Make initial admins superusers
    const admins: string[] = this.config.getOrThrow('initialAdmins');
    const rolePromises = admins.map(async (admin) => {
      await this.authZService.addRoleForUser(admin, 'superuser');
    });

    await Promise.all(rolePromises);
  }
  async ensurePerm(user: string, resource: string, action: string) {
    try {
      await this.authZService.addPermissionForUser(user, resource, action);
    } catch {
      this.logger.warn('Permission already exists');
    }
  }
}
