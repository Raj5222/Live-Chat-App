import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { Roles } from "./Role";
import { User_Tr } from "./Users_Tr";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  @OneToMany(() => User_Tr, (user) => user.user_u_id)
  user_u_id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    default: false,
  })
  status: boolean;

  @ManyToOne(() => Roles, (role) => role.role_u_id)
  @JoinColumn({ name: "role" })
  @Column({ default: 3 })
  role: number;

  @Column({
    unique: true,
  })
  u_id: string;

  @Column({
    type: "bigint",
  })
  mobile: number;

  @Column()
  jwt_token: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;
}
