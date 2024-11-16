import { Router} from "express";
import { encry, addUserStaff } from "../controllers/userCreateController";
import { pdfgenerate } from "../controllers/pdfController";
import { loginUsers } from "../controllers/loginUsersController";
import { getUsersdata } from "../controllers/getUserdata";


const router = Router();

router.post("/login", loginUsers);
router.post("/data", getUsersdata);
router.post("/create", addUserStaff);
router.post("/enc", encry);
router.get("/pdf", pdfgenerate);

export default router;
