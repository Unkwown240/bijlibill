import { Router } from "express";
import { addSingle, data, user } from "../controllers/ReadingController.js";

const readRoutes = Router();

readRoutes.get("/addsingle", addSingle);
readRoutes.post("/data", data);
readRoutes.get("/user", user);
export default readRoutes

/*

Endpoints -

for sending one dataslot at a time 

/api/addsingle [2 or 5min delay averaging]
/api/voltage
/api/current
/api/power
/api/aEnergy
/api/userdetail

*/
