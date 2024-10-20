import mongoose from "mongoose";
import { genSalt } from "bcrypt";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required."],
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minLength: 6
    }
})

export default mongoose.model("User", userSchema);
