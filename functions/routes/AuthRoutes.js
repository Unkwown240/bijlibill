import { Router } from "express";
import { refresh, signin, signup } from "../controllers/AuthController.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/signin", signin);
authRoutes.post("/refresh", refresh);

export default authRoutes

/*

Endpoints -

for authentication

/api/auth/signup
/api/auth/signin
/api/auth/refresh

*/