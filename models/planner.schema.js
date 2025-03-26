const mongoose = require("mongoose");

const plannerSchema = new mongoose.Schema({
    img: { type: String, required: true }, 
}, { timestamps: true });

const planner = mongoose.model("planner", plannerSchema);
module.exports = planner;
