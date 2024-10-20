import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Reading from "../models/ReadingModel.js";

export const addSingle = async (req, res, next) => {
    const { voltage, current, power, aEnergy, email } = req.query;
    console.log(email)
    let user, reading;
    try {
        user = await User.findOne({ email });
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: "Internal Server Error"})
    }
    if (!user){
        return res.status(400).send({message: "Wrong Credentials!"})
    }
    try {
        const date = new Date;
        reading = await Reading.findOne({ email })
        await Reading.updateOne({ email }, { $set: {
            voltage: reading.voltage.concat(voltage.toString()),
            current: reading.current.concat(current.toString()),
            power: reading.power.concat(power.toString()),
            aEnergy: reading.aEnergy.concat(aEnergy.toString()),
            date: reading.date.concat(date.toISOString())
        }})
        return res.status(200).send({message: "Updated database!"})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: "Internal Server Error"})
    }
}

const detail = (data) => {
    let sum = 0, high, low;
    high = low = data[0]['value'];
    for (let i = 0; i < data.length; i++) {
      const num = data[i]['value'];
      if (num > high) high = num;
      if (num < low) low = num;
      sum += num;
    }
    return {avg: sum/data.length, low: low, high: high}
}

const dataOrganizer = (data, date, range) => {
    let l = [], inc = 0, r = 0;
    if (range == "10min"){
        inc = 1, r = 5;
        if(data.length < r){
            for (let i = 0; i < data.length; i += inc) {
                l = l.concat({date: date[i], value: parseFloat(data[i])})
            }
        }
        else{
            for (let i = data.length - r; i < data.length; i += inc) {
                l = l.concat({date: date[i], value: parseFloat(data[i])})
            }
        }
        return l;
    }
    else{
        if (range == "1hr") { inc = 2, r = 30; }
        if (range == "1day") { inc = 30, r = 30*24; }
        if (range == "1mon") { inc = 30*30, r = 30*24*30; }
        if(data.length < r){
            for (let i = 0; i < data.length; i += inc) {
                let s = 0, avg = 0;
                for (let k = i; k < data.length && k < i+inc; k++) {
                    s = s + parseFloat(data[k]);
                }
                avg = s/(inc);
                l = l.concat({date: date[i], value: avg})
            }
        }
        else{
            for (let i = data.length - r; i < data.length; i += inc) {
                l = l.concat({date: date[i], value: parseFloat(data[i])})
            }
        }
        if(l.length === 1) l = [{date: date[0], value: 0}, l[0]]
        return l;
    }
}

export const data = async (req, res, next) => {
    try {
        const { data, range } = req.body;
        let dec;
        console.log(data, range)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.status(406).send({ message: "Unauthorized!" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if(err){
                if(err.message === "jwt expired") { return res.status(401).send({ message: "Token Expired!" }) }
                else { return res.status(406).json({message: "Unauthorized!"}) }
            }
            else dec = decoded
        });
        if(dec){
        Reading.findOne({ email: dec.email })
        .then((reading) => {
            if(data == "voltage"){
                let final = dataOrganizer(reading.voltage, reading.date, range)
                return res.status(200).send({ data: final, detail: detail(final) })
            }
            if(data == "current"){
                let final = dataOrganizer(reading.current, reading.date, range)
                return res.status(200).send({ data: final, detail: detail(final) })
            }
            if(data == "power"){
                let final = dataOrganizer(reading.power, reading.date, range)
                return res.status(200).send({ data: final, detail: detail(final) })
            }
            if(data == "aEnergy"){
                let final = dataOrganizer(reading.aEnergy, reading.date, range)
                return res.status(200).send({ data: final, detail: detail(final) })
            }
        }) 
        .catch(console.log)
        }
        else { console.log("dec : ", dec)}
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: "Internal Server Error"})
    }
}


export const user = async (req, res, next) => {
    try {
        let user, dec;
        const authHeader = req.headers['authorization'];
        console.log("i am here")
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.status(406).send({ message: "Unauthorized!" });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err){
                if(err.message === "jwt expired") { return res.status(401).send({ message: "Token Expired!" }) }
                else { return res.status(406).json({message: "Unauthorized!"}) }
            }
            else dec = decoded
        });
        if (dec) {
            console.log("i am here")
            user = await User.findOne({ email: dec.email })
            let obj = {
                id: user.id,
                name: user.name,
                email: user.email
            }
            return res.status(200).send({ user: obj })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: "Internal Server Error"})
    }
}