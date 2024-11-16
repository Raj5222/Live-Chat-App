import { Request, Response, Errback, NextFunction } from "express";
import { User } from "../entity/Users";
import Crypto from "../Services/crypto";
import { generateToken, verifyToken } from "../Services/jwt";
import { sendEmail } from "../Services/mail";
import { AppPostgressSource } from "../config/data-source1";
import { Like } from "typeorm";

const userRepository = AppPostgressSource.getRepository(User);

// Add User
export const addUserStaff = async (
  req: Request,
  res: Response,
  err: Errback
) => {
  try {
    const user:any =  await Crypto.decryptJson(req.body.data);

      user.password = await Crypto.encrypt(user.password).then(); //Pasword ecrpt

      const count = await userRepository.count({
        where: { firstname: Like(`${await user.firstname.slice(0, 3)}%`) },
      });
      user.u_id =
        user.firstname.slice(0, 3) + (count + 1).toString().padStart(4, "0"); //Uid Set

      console.log(user);
      user.jwt_token = await generateToken(user.u_id);

      try {
        const newUser = await userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(user)
          .execute().then();

        res.status(201).json("New User Created");
        await sendEmail(
          "raj.sathavara122@gmail.com",
          `New Account Created.`,
          user.firstname,
          `New User ${user.firstname}, U_ID ${user.u_id} Created If You Want To Acctive This Account Then Click The Given Link`,
          `http://localhost:3000/api/active/?user=${user.u_id}`
        );
      } catch (error) {
        res.status(404).json("User Arlready Available");
        err(error)
      }
  } catch (error) {
    err(error);
  }
};

export const encry = async (req: Request, res: Response, err: Errback) => {
  // Temperary Encrypt and Decrypt
  const user = req.body;
  console.log("Authorization => ", req.headers.Authorization);
  console.log(" <= End");

  try {
    if (req.body.flag === true) {
      let data: any = await Crypto.decryptJson(req.body.data);
      res.status(201).json(data);
    } else {
      let data: any = await Crypto.encryptJson(req.body);
      res.status(201).json(data);
    }
  } catch (error) {
    err(error);
  }
};
