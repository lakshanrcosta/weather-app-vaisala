import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Upload } from './entities/Upload';
import { WeatherData } from './entities/WeatherData';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Upload, WeatherData],
  synchronize: true, // Should be false in production
  logging: true
});
