import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { User } from "./Users";


@Entity("role")
export class Roles {
  @PrimaryGeneratedColumn()
  @OneToMany(() => User, (user) => user.role)
  role_u_id: number;
  @Column({
    unique: true,
  })
  @OneToMany(() => User, (user) => user.role)
  role: string;
}
