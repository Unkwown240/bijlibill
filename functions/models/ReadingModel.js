import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
    voltage:{
        type: [String],
        default: []
    },
    current: {
        type: [String],
        default: []
    },
    power: {
        type: [String],
        default: []
    },
    aEnergy: {
        type: [String],
        default: []
    },
    date: {
        type: [Date],
        default: []
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true
    }
})

export default mongoose.model("Reading", readingSchema);
