const product=require("../models/product.schema")
const cart=require("../models/cart.schema")
const banner=require("../models/banner.schema")
const Razorpay = require("razorpay")
const Fuse=require("fuse.js")
const user = require("../models/user.schema")

const create=async(req,res)=>{
    try{
        let data=await product.find()
        res.send(data)
    }
    catch(error){
        res.status(404).send(error.message)
    }
}
const createBy = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No data received!" });
        }

        req.body.createBy = req.user.id;
        const { title, img, desc, date, time, tickets, category, stock } = req.body;

        if (!title || !img || !desc || !date || !time || !tickets || tickets.length === 0 || !category || !stock) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newEvent = new product({
            title,
            img,
            desc,
            date,
            time,
            tickets,
            category,
            stock,
            createBy: req.user.id
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// admin

const admin=async(req,res)=>{
    let data=await product.find({createBy:req.user.id})
    res.send(data)
}

const shop=async(req,res)=>{
    res.render("shop")
}

const productpage=async(req,res)=>{
    res.render("productpage")
}

const getuser=async(req,res)=>{
    res.render("users")
}
const home=async(req,res)=>{
      const bannerhome= await banner.find()
          res.render("home", {bannerhome});
}
const about=async(req,res)=>{
    res.render("about")
}
// cart
// Adds a product to the cart.
const carts = async (req, res) => {
    let userID = req.user.id;
    req.body.userID = userID;

    console.log("Incoming cart data:", req.body); // Debugging: Log incoming data

    // Fetch the selected product
    let productData = await product.findById(req.body.productID);
    if (!productData) {
        return res.status(404).send("Product not found");
    }

    let { ticketType, price } = req.body; // Get ticket type and price from request

    if (!ticketType || !price) {
        return res.status(400).send("Ticket type and price are required"); // Ensure data is sent
    }

    let cartItem = await cart.create({
        userID: userID,
        productID: req.body.productID,
        ticketType: ticketType, // Store selected ticket type
        price: price, // Store ticket price
        qty: 1 // Default quantity
    });

    console.log("Cart Item Added:", cartItem); // Debugging: Log stored cart item

    res.send(cartItem);
};

// Retrieves and displays the user’s cart items.
const cartfind = async (req, res) => {
    console.log("Fetching cart for user:", req.user.id); // Debugging

    let data = await cart.find({ userID: req.user.id }).populate("productID");
    
    console.log("Cart Data:", data); // Debugging: Log fetched cart items

    res.send(data);
};

// Renders the cart page using a template engine
const getcart=async(req,res)=>{
    res.render("cart")
}
// Updates the quantity of a cart item or removes it if the quantity reaches 0.
const updatecart = async (req, res) => {
    let { qty } = req.body; // This is the change (+1 or -1)
    let { id } = req.params;

    let data = await cart.findById(id);
    if (!data) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    data.qty += qty; // ✅ Correctly updating the quantity

    if (data.qty <= 0) {
        await cart.findByIdAndDelete(id);
        return res.json({ success: true, message: "Item removed from cart" });
    }

    await data.save();
    res.json({ success: true, updated: data });
};


const allproduct = async(req,res) =>{
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
    key_id:"rzp_test_7Grqtls4UrZJlU",
    key_secret:"UvsWz2UDN7jcSM58yluYTxIz"
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

        console.log("Fetched Product Data:", productData); // Debugging

        // Ensure tickets exist and are an array
        if (!Array.isArray(productData.tickets)) {
            productData.tickets = [];
        }

        res.render("singlepage", { singlepage: productData });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Server Error");
    }
};

const search = async(req,res)=>{
   
        const {query} = req.query;

        console.log(query);
        const products = await product.find();

        const options = {
            keys:["title","category","price"], 
        }

        const fuse = new Fuse(products,options);
        const result = fuse.search(query);
        console.log(result);
        return res.send(result);
}

const deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProduct = await product.findByIdAndDelete(id);
      if (deletedProduct) {
        return res.status(200).json({ message: "Product deleted successfully" });
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error deleting product", error });
    }
  };

  const productUpdate = async (req, res) => {
    try {
        const { _id, title, desc, date, time, category, stock, ticketType, ticketPrice, img } = req.body;

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
            tickets,
            img
        };

        const updatedProduct = await product.findByIdAndUpdate(_id, updatedDetails, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.redirect("/product/getuser"); // Redirect to the admin product list
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error updating product", error });
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

module.exports={home,create,about,createBy,productpage,getuser,admin,shop,carts,cartfind,getcart,updatecart,payment,allproduct,pricefilter,filltercategory,singlepage,search,deleteProduct,productUpdate,editProductPage}