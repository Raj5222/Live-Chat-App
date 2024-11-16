import { Router } from "express";
import { fetchUsers, addUser} from "../controllers/customerController";

const router = Router();

router.get("/customer", fetchUsers);
router.post("/customer", addUser);

export default router;
