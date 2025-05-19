import { Upload } from '@project/shared/entities/Upload';
import { WeatherData } from '@project/shared/entities/WeatherData';
import Joi from 'joi';
import { DataSource } from 'typeorm';
import { IUser, IWeatherRecord } from '../types';
import { logger } from '../utils/logger';

const schema = Joi.object({
  city: Joi.string().required(),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  temp: Joi.number().required(),
  humidity: Joi.number().required(),
  weather_date: Joi.date().iso().required()
});

export async function processWeatherData(
  parsed: IWeatherRecord[],
  fileName: string,
  user: IUser,
  dataSource: DataSource
): Promise<boolean> {
  const uploadRepo = dataSource.getRepository(Upload);
  const weatherRepo = dataSource.getRepository(WeatherData);

  const total = parsed.length;
  let valid = 0;
  let invalid = 0;

  logger.info({ fileName, userId: user.id, total }, 'Processing weather data');

  let upload = await uploadRepo.findOne({
    where: { filename: fileName, user: { id: user.id } },
    relations: ['user']
  });

  if (upload) {
    logger.warn({ fileName, userId: user.id }, 'Duplicate upload detected, skip processing');
    return false;
  }

  upload = await uploadRepo.save(
    uploadRepo.create({ user, filename: fileName, total_records: total })
  );

  for (let i = 0; i < parsed.length; i++) {
    const entry = parsed[i];
    const { error } = schema.validate(entry);
    if (error) {
      logger.warn({ index: i, error: error.details[0].message }, 'Validation failed for record');
      invalid++;
      continue;
    }

    const weatherDate = new Date(entry.weather_date);
    const existing = await weatherRepo.findOneBy({
      lat: entry.lat,
      lon: entry.lon,
      weather_date: weatherDate
    });

    if (existing) {
      existing.temp = entry.temp;
      await weatherRepo.save(existing);
      logger.debug({ index: i, city: entry.city }, 'Updated existing weather entry');
    } else {
      await weatherRepo.save(
        weatherRepo.create({
          city: entry.city,
          lat: entry.lat,
          lon: entry.lon,
          temp: entry.temp,
          humidity: entry.humidity,
          weather_date: weatherDate,
          upload
        })
      );
      logger.debug({ index: i, city: entry.city }, 'Inserted new weather entry');
    }

    valid++;
    if (i % 10 === 0) {
      logger.info({ processed: i + 1, total }, 'Weather data progress');
    }
  }

  upload.valid_records = valid;
  upload.invalid_records = invalid;
  await uploadRepo.save(upload);

  logger.info({ fileName, valid, invalid }, 'Weather data processing completed');
  return true;
}
