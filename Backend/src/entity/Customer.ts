import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,ManyToOne,JoinColumn
} from "typeorm";
import { Roles } from "./Role";
import { User } from "./Users";

@Entity("customer")
export class Customer {
  @PrimaryGeneratedColumn()
  cust_u_id: number;
  @Column()
  firstname: string;
  @Column()
  lastname: string;
  @Column({
    unique: true,
  })
  email: string;
  @Column()
  password: string;

  @Column({
    default: false,
  })
  status: boolean;

  @ManyToOne(() => User, (user) => user.user_u_id, {
    cascade: true,
  })
  @JoinColumn({ name: "user_u_id" })
  user_u_id: number;

  @ManyToOne(() => Roles, (role) => role.role_u_id)
  @JoinColumn({ name: "role" })
  @Column({ default: 4 })
  role: number;

  @Column({
    type: "bigint",
  })
  mobile: number;
  @Column({
    unique: true,
  })
  u_id: string;
  @CreateDateColumn()
  Create_Time: string;
}
