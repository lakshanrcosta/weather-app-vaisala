/// <reference types="jest" />

import mockedEnv from 'mocked-env';

let restore: () => void;

beforeAll(() => {
  restore = mockedEnv({
    NODE_ENV: 'test',
    DEMO_USER_NAME: 'Test User',
    DEMO_USER_EMAIL: 'test@example.com',
    DEMO_USER_PASSWORD_HASHED: 'fake-hash',
    BUCKET_NAME: 'weather-data-uploads'
  });
});

afterAll(() => {
  restore();
});
