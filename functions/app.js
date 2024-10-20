import express from "express";
import dotenv from "dotenv";
import { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import serverless from "serverless-http";
import { refresh, signin, signup } from "./controllers/AuthController.js";
import { addSingle, data, user } from "./controllers/ReadingController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3031;
const databaseURL = process.env.DATABASE_URL;

// app.use(cors({
//     origin: process.env.ORIGIN,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
//     credentials: true,
// }))

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// const router = Router();
// app.use(router);
app.use("/.netlify/functions/api", (res, req) => res.json({mssg:"smthing cooking....."}));
// router.get("/", (req, res) => {
//     res.send("App is running..");
// });
// router.post("/api/auth/signup", signup);
// router.post("/api/auth/signin", signin);
// router.post("/api/auth/refresh", refresh);
// router.get("/api/addsingle", addSingle);
// router.post("/api/data", data);
// router.get("/api/user", user);


// const server = app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// })

mongoose
    .connect(databaseURL)
    .then(() => console.log("DB connected!"));


const handler =  serverless(app);

module.exports.handler = async(e, c) => {
    const res = await handler(e, c);
    return res;
}