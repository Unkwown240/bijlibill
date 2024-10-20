import express from "express";
import dotenv from "dotenv";
import { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import serverless from "serverless-http";
import authRoutes from "./routes/AuthRoutes.js";
import readRoutes from "./routes/ReadingRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3031;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
    credentials: true,
}))

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api", readRoutes)

app.use("/.netlify/functions/app", Router);

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

mongoose
    .connect(databaseURL)
    .then(() => console.log("DB connected!"));

export default serverless(app);