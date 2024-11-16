import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./Users";
import { location_arr } from "../temp";

@Entity("user_tr")
export class User_Tr {
  @PrimaryGeneratedColumn()
  user_tr_id: number;

  @Column({
    unique: true,
  })
  @ManyToOne(() => User, (user) => user.user_u_id)
  @JoinColumn({ name: "user_u_id" })
  user_u_id: string;

  @Column()
  name: string;

  @Column({ type: "jsonb" })
  location: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  Created_At: Date;
}
