import { Module } from '@nestjs/common';

import { AdministratorCommandsModule } from './administrator-commands/administrator-commands.module';
import { MemberCommandsModule } from './member-commands/member-commands.module';

@Module({
  imports: [AdministratorCommandsModule, MemberCommandsModule],
})
export class CommandsModule {}
