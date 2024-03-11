import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';

export const SprocketConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  expandVariables: true,
  load: [
    () => {
      dotenv.config();
      const configFile = env(readFileSync('./config.yaml', 'utf-8'));
      const config = yamlParse(configFile);
      const protocol = config.secure ? 'https' : 'http';
      return {
        ...config,
        protocol,
      };
    },
  ],
});

export { ConfigService as SprocketConfigService };
