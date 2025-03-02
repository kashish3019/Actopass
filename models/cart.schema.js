const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    ticketType: { type: String, required: true }, // Stores the selected ticket type
    price: { type: Number, required: true }, // Stores the ticket price
    qty: { type: Number, default: 1 } // Stores quantity of tickets
});

module.exports = mongoose.model("Cart", cartSchema);
