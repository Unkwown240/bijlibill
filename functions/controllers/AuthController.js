import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import User from "../models/UserModel.js";
import Reading from "../models/ReadingModel.js";
import cookieParser from "cookie-parser";
import { isObjectIdOrHexString, isValidObjectId } from "mongoose";

const acsAge = '10m';
const refAge = '1d';

const createAccessToken = (email) => {
    return jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: acsAge})
}
const createRefreshToken = (email) => {
    return jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET,{expiresIn: refAge})
}

export const signup = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            return res.status(400).send("Full Name, Email, password is required!")
        }
        let existingUser;
        try {
            existingUser = await User.findOne({email})
        } catch (error) {
            console.log(error)            
        }
        if (existingUser){
            return res.status(400).send("User already exists!")
        }
        const hashpass = hashSync(password, 10)
        const user = new User({name, email, password: hashpass})
        const reading = new Reading({ userId: user.id })
        try {
            await user.save()
            await reading.save()
        } catch (error) {
            console.log(error)
        }
        const access = createAccessToken(user.email)
        const refresh = createRefreshToken(user.email)
        console.log(access)
        res.cookie('jwt', refresh, {
            httpOnly: true,
            sameSite: 'None', 
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(201).json({ access, user: {
            id: user.id,
            name: user.name,
            email: user.email
        }})
    } catch (error) {
        console.error(error)
        return res.status(500).send("Internal Server Error!")
    }
}


export const signin = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send("Email, password is required!")
        }
        let existingUser;
        try {
            existingUser = await User.findOne({email})
        } catch (error) {
            console.log(error)            
        }
        if (!existingUser){
            return res.status(400).send("User does not exist!")
        }
        const matched = compareSync(password, existingUser.password)
        if (!matched){
            return res.status(400).send("Enter Correct Credentials!")
        }
        console.log(existingUser.email)
        const access = createAccessToken(existingUser.email)
        const refresh = createRefreshToken(existingUser.email)
        console.log(access)
        res.cookie('jwt', refresh, {
            httpOnly: true,
            sameSite: 'None', 
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ access, user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email
        }})
    } catch (error) {
        console.error(error)
        return res.status(500).send("Internal Server Error!")
    }
}


export const refresh = async (req, res, next) => {
    try {
        const { refresh } = req.body; let exp = false, dec;
        console.log("i am here", refresh)
        
        jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET, (err,decoded) => {
            if(err){
                if(err.message === "jwt expired") { 
                    dec = jwt.decode(refresh, process.env.REFRESH_TOKEN_SECRET)
                    exp = true
                }
                else { return res.status(406).json({message: "Unauthorized!"}) }
            }
            console.log("i am here", decoded)
            if(decoded) dec = decoded
        })

        const email = dec.email
        const access = createAccessToken(email)
        if(exp){
            const refresh = createRefreshToken(email)
            return res.status(200).json({ access, refresh })
        }
        return res.status(200).json({ access })
    } catch (error) {
        console.error(error)
        return res.status(500).send("Internal Server Error!")
    }
}





