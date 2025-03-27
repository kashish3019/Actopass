const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    img: { type: String, required: true },
    desc: { type: String, required: true },
    date: { type: Date, required: true }, 
    time: { type: String, required: true }, 
    address: { type: String, required: true }, 
    mapEmbed: { type: String, required: false }, 
    tickets: [
        {
            type: { type: String, required: true }, 
            price: { type: Number, required: true } 
        }
    ],
    category: { type: String, required: true },
    stock: { type: Number, required: true }, 
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" } 
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
