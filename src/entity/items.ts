/* tslint:disable */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  s3uploads_sha512: string;

  @Column()
  s3_key: string;

  @Column()
  created_at: number;

  @Column()
  updated_at: number;

}
/* tslint:enable */
