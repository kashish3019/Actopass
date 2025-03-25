const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    img: { type: String, required: true }, 
}, { timestamps: true });

const banner = mongoose.model("banner", bannerSchema);
module.exports = banner;
