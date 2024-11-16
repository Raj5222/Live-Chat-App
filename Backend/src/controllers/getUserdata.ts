import { Request, Response, Errback } from "express";
import { User } from "../entity/Users";
import { AppPostgressSource } from "../config/data-source1";
// import { getRedisClient } from "../Services/Redis_Service";

const userRepository = AppPostgressSource.getRepository(User);
const exptime = 120; // Expiration time in seconds

export const getUsersdata = async (
  req: Request,
  res: Response,
  err?: Errback
) => {
  try {
    const { id } = req.body;

    // Early return if id is missing
    if (!id) {
      res.status(400).json({ Error: "Please provide ID" });
    }

    if (id === "all") {
      // Get all users if id is 'all'
      const users = await userRepository.find();
      res.status(200).json(users);
    }

    // Attempt to get data from Redis cache
    // const redisData = await getRedisClient.get(`user?u_id=${id}`);

    // if (redisData != null) {
    //   // Cache hit
    //   console.log("Redis Hit");
    //   res.status(200).json(JSON.parse(redisData));
    // } else {
    //   // Cache miss, fetch from database
    //   console.log("Redis Miss");

      const userData = await userRepository.findOne({ where: { u_id: id } });

      if (!userData) {
        res.status(404).json({ Error: "User not found" });
      }

      // Set the user data to Redis with expiration time
      // await redisClient.setEx(
      //   `user?u_id=${id}`,
      //   exptime,
      //   JSON.stringify(userData)
      // );

      // console.log(`Redis Set New Data For ${exptime / 60} Min`);

      // Return user data
      res.status(200).json(userData);
    // }
  } catch (error) {
    console.error(error);
    // Send generic error message
    res.status(500).json({ Error: "Internal Server Error" });
  }
};
