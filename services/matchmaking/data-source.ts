import { DataSource } from 'typeorm';
import { Scrim } from './src/entities/scrim.entity';
import { ScrimPlayer } from './src/entities/scrim-player.entity';
import { ScrimTimeout } from './src/entities/scrim-timeout.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.MATCHMAKING_DB_HOST,
  port: Number(process.env.MATCHMAKING_DB_PORT) || 5432,
  username: process.env.MATCHMAKING_DB_USER,
  password: process.env.MATCHMAKING_DB_PASS,
  database: process.env.MATCHMAKING_DB_NAME,
  entities: [Scrim, ScrimPlayer, ScrimTimeout],
  synchronize: false,
  logging: false,
});
