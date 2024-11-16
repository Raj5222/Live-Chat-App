import { Request, Response, Errback} from "express";
import { User } from "../entity/Users";
import Crypto from "../Services/crypto";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken } from "../Services/jwt";
import { ChatRoom } from "./Socket_FCM";

const userRepository = AppPostgressSource.getRepository(User);

// Login User
export const loginUsers = async (req: Request, res: Response, err?: Errback) => {
  try {
    console.log("<= End");
    let body: any = await Crypto.decryptJson(req.body.data);
    // const body:any = await CryptoService.encryptJson(req.body)
    console.log("Decrypted Data => ", body);

    const { email, password, id } = body;

    if (!(email || id) || !password) {
      res
        .status(400)
        .json({ error: "Please provide ID or email and password" });
    }

    let user;
    try {
      if (id) {
        try {
          user = await userRepository
            .createQueryBuilder("user")
            .select(["user.u_id", "user.firstname", "user.password"])
            .where("user.u_id = :id", { id: id })
            .getOne();
        } catch {
          res.status(401).json({ error: "User ID Not Found." });
        }
      }
      if (email) {
        try {
          user = await userRepository
            .createQueryBuilder("user")
            .select(["user.u_id", "user.firstname", "user.password"])
            .where("user.email = :email", { email: email })
            .getOne();
        } catch {
          res.status(401).json({ error: "User Not Found." });
        }
      }
      if (!user) res.status(401).json({ error: "Email Not Found." });
      console.log("Given Password => ", password);
      const isValidPassword =
        (await Crypto.encrypt(password)) === user.password ? true : false;

      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid Password." });
      }
      res.status(200).json({
        message: `Welcome ${user.firstname}`,
        token: generateToken(user.u_id),
        username: user.firstname,
        uid : user.u_id
      });
      ChatRoom()
    } catch (error) {
      err(error);
    }
  } catch (error) {
    err(error);
  }
};
