const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    ticketType: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    qty: { type: Number, default: 1 },
});

module.exports = mongoose.model("Cart", cartSchema);
