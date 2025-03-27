const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    img: { type: String, required: true }, 
}, { timestamps: true });

const offer = mongoose.model("offer", offerSchema);
module.exports = offer;
