import { DataSource } from "typeorm";
import { UserEntity } from "./core/src/db/user/user.entity";
import { config } from "dotenv";

config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "sprocket",
  entities: [UserEntity],
  synchronize: false,
});

AppDataSource.initialize()
  .then(async () => {
    const userRepo = AppDataSource.getRepository(UserEntity);
    const users = await userRepo.find();
    console.log(`Total users found: ${users.length}`);
    if (users.length > 0) {
      console.log("Sample user:", users[0].username);
    } else {
      console.log("No users found in DB.");
    }
    await AppDataSource.destroy();
  })
  .catch((error) => console.log(error));
