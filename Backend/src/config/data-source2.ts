import { config } from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";

config()
// Ensure that we have the necessary environment variables
if (!process.env.MongoDbString || !process.env.db2) {
  throw new Error("Missing necessary environment variables in .env file");
}

export const AppMongoDBSource = new DataSource({
  type: "mongodb",
  url: process.env.MongoDbString,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
});
