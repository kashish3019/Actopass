const product = require("../models/product.schema")
const cart = require("../models/cart.schema")
const banner = require("../models/banner.schema")
const planner = require("../models/planner.schema")
const Razorpay = require("razorpay")
const fs = require("fs");
const user = require("../models/user.schema")
const path = require("path");
const offer = require("../models/offer.schema")

const create = async (req, res) => {
    try {
        let data = await product.find()
        res.send(data)
    }
    catch (error) {
        res.status(404).send(error.message)
    }
}
const createBy = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No data received!" });
        }

        req.body.createBy = req.user.id;
        const { title, desc, date, time, category, stock, address, mapEmbed } = req.body;

        if (!title || !req.file || !desc || !date || !time || !category || !stock || !address || !mapEmbed) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Extract and process ticket types and prices
        let tickets = [];
        if (Array.isArray(req.body.ticketType) && Array.isArray(req.body.ticketPrice)) {
            tickets = req.body.ticketType.map((type, index) => ({
                type,
                price: Number(req.body.ticketPrice[index]),
            }));
        }

        if (tickets.length === 0) {
            return res.status(400).json({ message: "At least one ticket type is required!" });
        }

        const newEvent = new product({
            title,
            img: req.file.filename,
            desc,
            date,
            time,
            tickets,
            category,
            stock,
            address,
            mapEmbed,
            createBy: req.user.id,
        });

        await newEvent.save();
        return res.redirect("/product/getuser");

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// admin
const admin = async (req, res) => {
    let data = await product.find({ createBy: req.user.id })
    res.send(data)
}

const shop = async (req, res) => {
    res.render("shop")
}

const productpage = async (req, res) => {
    res.render("productpage")
}
const getuser = async (req, res) => {
    try {
        const products = await product.find();

        const updatedProducts = products.map(prod => ({
            ...prod._doc,
            img: `/images/${prod.img}`
        }));

        res.render("users", { products: updatedProducts });

    } catch (error) {
        res.status(500).send("Server Error");
    }
};

const home = async (req, res) => {
    try {
        const bannerhome = await banner.find();
        const plannerhome = await planner.find();
        const products = await product.find().limit(6); 
        const offers = await offer.find().limit(1);

        res.render("home", { bannerhome, plannerhome, products , offers});
    } catch (error) {
        console.error("Error fetching data for home:", error);
        res.status(500).send("Error loading home page");
    }
};

const about = async (req, res) => {
    res.render("about")
}
// cart
const carts = async (req, res) => {
    let userID = req.user.id;
    req.body.userID = userID;

    console.log("Incoming cart data:", req.body);

    let productData = await product.findById(req.body.productID);
    if (!productData) {
        return res.status(404).send("Product not found");
    }

    let { ticketType, price } = req.body;

    if (!ticketType || !price) {
        return res.status(400).send("Ticket type and price are required");
    }

    let cartItem = await cart.create({
        userID: userID,
        productID: req.body.productID,
        ticketType: ticketType,
        price: price,
        qty: 1
    });

    console.log("Cart Item Added:", cartItem);

    res.send(cartItem);
};

const cartfind = async (req, res) => {
    try {
        console.log("Fetching cart for user:", req.user.id);

        let data = await cart.find({ userID: req.user.id }).populate("productID");

        console.log("Cart Data:", JSON.stringify(data, null, 2)); // Debugging

        res.send(data);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).send("Server Error");
    }
};
const getcart = async (req, res) => {
    res.render("cart")
}
const updatecart = async (req, res) => {
    let { qty } = req.body;
    let { id } = req.params;

    let data = await cart.findById(id);
    if (!data) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    data.qty += qty;

    if (data.qty <= 0) {
        await cart.findByIdAndDelete(id);
        return res.json({ success: true, message: "Item removed from cart" });
    }

    await data.save();
    res.json({ success: true, updated: data });
};


const allproduct = async (req, res) => {
    try {
        let data = await product.find()
        res.send(data)
    }
    catch (error) {
        res.send({ msg: error })
    }
}


const filltercategory = async (req, res) => {
    const { category } = req.query

    console.log(category);
    try {
        let data = await product.find({ category })
        res.send(data)
    }
    catch (error) {
        res.send({ msg: error })
    }
}

const pricefilter = async (req, res) => {
    const { sort } = req.query
    if (sort == "lth") {
        const data = await product.find().sort({ price: 1 })
        res.send(data)
    }

    else if (sort == "htl") {
        const data = await product.find().sort({ price: -1 })
        res.send(data)
    }
}

let razorpay = new Razorpay({
    key_id: "rzp_test_7Grqtls4UrZJlU",
    key_secret: "UvsWz2UDN7jcSM58yluYTxIz"
})

const payment = (req, res) => {
    let options = {
        amount: req.body.amount * 100,
        currency: "INR"
    }
    razorpay.orders.create(options, (err, order) => {
        if (err) {
            console.log(err);
            res.send({ status: err })
        }
        else {
            res.send(order)
        }
    })
}

// singlepage
const singlepage = async (req, res) => {
    try {
        const { id } = req.params;
        let productData = await product.findById(id);

        if (!productData) {
            return res.status(404).send("Product not found");
        }

        console.log("Fetched Product Data:", productData);

        if (!Array.isArray(productData.tickets)) {
            productData.tickets = [];
        }

        res.render("singlepage", { singlepage: productData });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Server Error");
    }
};

const search = async (req, res) => {

    const { query } = req.query;

    console.log(query);
    const products = await product.find();

    const options = {
        keys: ["title", "category", "price"],
    }

    const fuse = new Fuse(products, options);
    const result = fuse.search(query);
    console.log(result);
    return res.send(result);
}

const deleteProduct = async (req, res) => {
    try {
        const { product_id } = req.params;  // Query params se ID lena

        if (!product_id) {
            return res.status(400).json({ status: false, message: "Product ID is required" });
        }

        const deletedProduct = await product.findByIdAndDelete(product_id);

        if (!deletedProduct) {
            return res.status(404).json({ status: false, message: "Product not found" });
        }

        return res.status(200).json({ status: true, message: "Product deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Error deleting product", error });
    }
};

const productUpdate = async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Uploaded File:", req.file);

        const { _id, title, desc, date, time, category, stock, ticketType, ticketPrice } = req.body;

        const productUp = await product.findById(_id);
        if (!productUp) {
            return res.status(404).json({ message: "Product not found" });
        }

        const tickets = ticketType.map((type, index) => ({
            type,
            price: Number(ticketPrice[index]),
        }));

        let updatedDetails = {
            title,
            desc,
            date,
            time,
            category,
            stock: Number(stock),
            tickets
        };
        if (req.file) {
            if (product.img) {
                const oldImagePath = path.join(__dirname, "..", "public", "images", product.img);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log("Old image deleted:", product.img);
                }
            }
            updatedDetails.img = req.file.filename;
        }
        const updatedProduct = await product.findByIdAndUpdate(_id, updatedDetails, { new: true });
        return res.redirect("/product/getuser");
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

const editProductPage = async (req, res) => {
    try {
        const { id } = req.params;
        let productData = await product.findById(id);
        if (!productData) {
            return res.status(404).send("Product not found");
        }
        res.render("editProduct", { product: productData });
    } catch (error) {
        res.status(500).send("Error loading product details");
    }
};
// home page par dynamic event 
const getHomePage = async (req, res) => {
    try {
        const products = await product.find().limit(6); // Sirf 6 products fetch karein
        res.render("home", { products }); // EJS ke liye render karein
    } catch (error) {
        console.log("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { home, create, about, createBy, productpage, getuser, admin, shop, carts, cartfind, getcart, updatecart, payment, allproduct, pricefilter, filltercategory, singlepage, search, deleteProduct, productUpdate, editProductPage, getHomePage }