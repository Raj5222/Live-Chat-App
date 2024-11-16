import { Router } from "express";
import { active } from "../controllers/activeAccountController";
import { updateRole } from "../controllers/roleController";

const activeUser = Router();

activeUser.get("/active", active);
activeUser.post("/role", updateRole);

export default activeUser;
