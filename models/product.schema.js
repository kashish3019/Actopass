const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Event Name
    img: { type: String, required: true }, // Event Image URL
    desc: { type: String, required: true }, // Event Description
    date: { type: Date, required: true }, // Event Date
    time: { type: String, required: true }, // Event Time (as string for flexibility)
    tickets: [
        {
            type: { type: String, required: true },  // Ticket Type (General, VIP, etc.)
            price: { type: Number, required: true } // Price for that ticket type
        }
    ],
    category: { type: String, required: true }, // Event Category
    stock: { type: Number, required: true }, // Available Tickets (Stock)
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" } // Admin who created event
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
