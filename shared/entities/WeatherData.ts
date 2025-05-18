import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Upload } from './Upload';

@Entity('weather_data')
@Unique(['lat', 'lon', 'weather_date']) // Composite uniqueness
export class WeatherData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Upload, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_id' })
  upload: Upload;

  @Column()
  city: string;

  @Column('double precision')
  lat: number;

  @Column('double precision')
  lon: number;

  @Column('double precision')
  temp: number;

  @Column('double precision')
  humidity: number;

  @Column({ type: 'date' })
  weather_date: Date;
}
