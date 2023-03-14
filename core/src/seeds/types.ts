import type {Seeder} from "nestjs-seeder";

export interface SmartSeeder<T> extends Seeder {
    created: T[];
    seed: () => Promise<void>;
    drop: () => Promise<void>;
}
