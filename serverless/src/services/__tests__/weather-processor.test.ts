import { processWeatherData } from '../weather-processor';
import { DataSource } from 'typeorm';
import { Upload } from '@project/shared/entities/Upload';
import { WeatherData } from '@project/shared/entities/WeatherData';
import { IUser, IWeatherRecord } from '../../types';
import { logger } from '../../utils/logger';

const mockUser: IUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password_hash: 'hash',
  created_at: new Date(),
  modified_at: new Date()
};

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('processWeatherData - Simplified Tests', () => {
  const setup = () => {
    const mockUploadRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (data) => ({ ...data, id: 1 })),
      create: jest.fn((data) => data)
    };

    const mockWeatherRepo = {
      findOneBy: jest.fn(),
      save: jest.fn().mockImplementation(async (data) => ({ ...data, id: 1 })),
      create: jest.fn((data) => data)
    };

    const mockDataSource = {
      getRepository: (entity: typeof Upload | typeof WeatherData) => {
        if (entity === Upload) return mockUploadRepo;
        if (entity === WeatherData) return mockWeatherRepo;
        throw new Error('Unknown entity');
      }
    } as unknown as DataSource;

    return { mockUploadRepo, mockWeatherRepo, mockDataSource };
  };

  const validRecord: IWeatherRecord[] = [
    {
      city: 'Helsinki',
      lat: 60.17,
      lon: 24.94,
      temp: 5.5,
      humidity: 70,
      weather_date: new Date().toISOString()
    }
  ];

  it('UT-001: should skip processing if file already uploaded', async () => {
    const { mockUploadRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue({ id: 1 });

    const result = await processWeatherData(
      validRecord,
      'duplicate.json',
      mockUser,
      mockDataSource
    );

    expect(result).toBe(false);
    expect(mockUploadRepo.save).not.toHaveBeenCalled();
  });

  it('UT-002: should validate and insert valid weather records', async () => {
    const { mockUploadRepo, mockWeatherRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue(null);
    mockWeatherRepo.findOneBy.mockResolvedValue(null);

    const result = await processWeatherData(validRecord, 'valid.json', mockUser, mockDataSource);

    expect(result).toBe(true);
    expect(mockUploadRepo.save).toHaveBeenCalled();
    expect(mockWeatherRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Helsinki' })
    );
  });

  it('UT-003: should update existing weather record with same lat/lon/date', async () => {
    const { mockUploadRepo, mockWeatherRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue(null);
    mockWeatherRepo.findOneBy.mockResolvedValue({ id: 999, city: 'Helsinki', temp: 2 });

    const result = await processWeatherData(validRecord, 'update.json', mockUser, mockDataSource);

    expect(result).toBe(true);
    expect(mockWeatherRepo.save).toHaveBeenCalledWith(expect.objectContaining({ temp: 5.5 }));
  });

  it('UT-004: should skip invalid records (Joi validation fails)', async () => {
    const { mockUploadRepo, mockWeatherRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue(null);

    const invalidRecord: IWeatherRecord[] = [
      { ...validRecord[0], temp: 'invalid' as unknown as number }
    ];

    const result = await processWeatherData(
      invalidRecord,
      'invalid.json',
      mockUser,
      mockDataSource
    );

    expect(result).toBe(true);
    expect(mockWeatherRepo.save).not.toHaveBeenCalled();
  });

  it('UT-005: should correctly update valid_records and invalid_records count', async () => {
    const { mockUploadRepo, mockWeatherRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue(null);
    mockWeatherRepo.findOneBy.mockResolvedValue(null);

    const mixedRecords: IWeatherRecord[] = [
      validRecord[0],
      { ...validRecord[0], temp: 'invalid' as unknown as number }
    ];

    await processWeatherData(mixedRecords, 'mixed.json', mockUser, mockDataSource);

    const savedUpload = mockUploadRepo.save.mock.calls.at(-1)[0];
    expect(savedUpload.valid_records).toBe(1);
    expect(savedUpload.invalid_records).toBe(1);
  });

  it('UT-006: should call logger at various steps', async () => {
    const { mockUploadRepo, mockWeatherRepo, mockDataSource } = setup();
    mockUploadRepo.findOne.mockResolvedValue(null);
    mockUploadRepo.create.mockImplementation((data) => data);
    mockUploadRepo.save.mockResolvedValue({ id: 1 });

    mockWeatherRepo.findOneBy.mockResolvedValue(null);
    mockWeatherRepo.create.mockImplementation((data) => data);
    mockWeatherRepo.save.mockResolvedValue({ id: 2 });

    await processWeatherData(validRecord, 'log.json', mockUser, mockDataSource);

    expect(logger.info).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });
});
