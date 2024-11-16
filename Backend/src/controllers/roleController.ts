import { Errback, Request, Response } from "express";
import { User } from "../entity/Users";
import { Roles } from "../entity/Role";
import { AppPostgressSource } from "../config/data-source1";
import { verifyToken } from "../Services/jwt";
import { error } from "console";

const userRepository = AppPostgressSource.getRepository(User);
const rolesRepository = AppPostgressSource.getRepository(Roles);

export const updateRole = async (req: Request, res: Response,err:Errback) => {
  try {
    // Validate request body
    const newrole = req.body.newrole;
    if (!newrole) {
      res.status(400).json({ error: "Invalid request: newrole is required" });
    }

    // Validate JWT token
    const jwtToken = req.headers.authorization;
    if (!jwtToken) {
      res.status(401).json({ error: "JWT token is required" });
    }

    const decoded = verifyToken(jwtToken);

    if (!decoded.exp)
      res.status(500).json({ error: "Invalid Or Expired JWT token" });

    if (decoded.exp) {
      try {
        // Verify super user
        const superUser = await userRepository
          .createQueryBuilder("user")
          .select(["user.jwt_token"])
          .where("user.jwt_token = :jwt AND user.role IN :roles", {
            roles: [1,2],
            jwt: jwtToken,
          })
          .getOne();

          console.log(`Super User =>`,superUser)

        if (!superUser) {
          res.status(500).json({
            error:
              "You Cannot Add New Role. Please Contact With Admin Or Super Admin",
          });
        }
        const dataRole = rolesRepository.create({ role: newrole });
        const roleUpdate = await rolesRepository.save(dataRole);
        res
          .status(201)
          .json({ Message: "New Role Inserted", Updated: roleUpdate });
      } catch (err) {
        res
          .status(404)
          .json({ error: `${newrole} is Already Available in Roles.`});
      }
    }

  } catch (error) {
    err(error);
  }
};
