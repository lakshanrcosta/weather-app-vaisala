export interface IWeatherRecord {
  city: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  weather_date: string;
}

export interface IUser {
  id: number;
  name?: string;
  email: string;
  password_hash: string;
  created_at?: Date;
  modified_at?: Date;
}
