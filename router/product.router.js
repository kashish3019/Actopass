const {Router}=require("express")
const verifyToken=require("../middleware/isauth")
const isAdmin = require("../middleware/admin")
const{create,createBy,productpage,getuser, shop, carts, cartfind,getcart,updatecart, payment, home, allproduct, filltercategory, pricefilter, singlepage, admin, search, deleteProduct, updateProduct, productUpdate, editProductPage, about}=require("../controllers/product.controllers")
const route=Router()
const multer=require("multer")
const productController = require("../controllers/product.controllers");
const store = multer.diskStorage({
    destination: "public/images",
    filename: (req, File, cb) => {
      cb(null, Date.now() + File.originalname);
    },
  });
  const upload = multer({
    storage: store,
  }).single("img");

route.get("/home",home)
route.get("/shop",verifyToken,shop)
route.get("/about",about)
route.get("/",create)
route.post("/productpage",upload,isAdmin,createBy)
route.get("/productpage",isAdmin,productpage)
route.post("/productupdate",upload,productUpdate)

route.get("/admin",verifyToken,admin)
route.get("/getuser",getuser)
route.get("/edit/:id", isAdmin, editProductPage);
route.delete("/delete/:product_id", productController.deleteProduct);
// dynamic home page event 
route.get("/", productController.getHomePage);

route.post("/cart",verifyToken,carts)
route.get("/cart",verifyToken,getcart)
route.get("/cartfind",verifyToken,cartfind)
route.patch("/cart/update/:id",verifyToken,updatecart)
route.get("/allproduct",allproduct)
route.get("/singlepage/:id",verifyToken,singlepage)
route.get("/filter",filltercategory)
route.get("/sort",pricefilter)
route.get("/search",search)

// banner section

const bannercontroller=require("../controllers/banner.controller")
// backend api
route.post("/addbanner",upload,bannercontroller.addBanner)
route.post("/updatebanner",upload,bannercontroller.Updatebanner)
route.post("/delete",bannercontroller.Deletebanner);
// fronted api
route.get("/getbanner",bannercontroller.bannerget)
route.get("/editbanner",bannercontroller.bannerEdit)
route.get("/addbanner",bannercontroller.Addbanner)
// home page get
route.get("/", bannercontroller.getHomeBanners); 


// planner section
const plannercontroller=require("../controllers/planner.controller")
// backend api
route.post("/addplanner",upload,plannercontroller.addplanner)
route.post("/updateplanner",upload,plannercontroller.Updateplanner)
route.delete("/deleteplanner/:planner_id", plannercontroller.Deleteplanner);
// fronted api
route.get("/getplanner",plannercontroller.plannerget)
route.get("/editplanner",plannercontroller.plannerEdit)
route.get("/addplanner",plannercontroller.Addplanner)
// home page get
route.get("/", plannercontroller.getHomeplanners);


// offer section 
const offercontroller=require("../controllers/offer.controller")
// backend api
route.post("/addoffer",upload,offercontroller.addoffer)
route.post("/updateoffer",upload,offercontroller.Updateoffer)
route.delete("/deleteoffer/:offer_id", offercontroller.Deleteoffer);
// fronted api
route.get("/getoffer",offercontroller.offerget)
route.get("/editoffer",offercontroller.offerEdit)
route.get("/addoffer",offercontroller.Addoffer)

// home page get
route.get("/", offercontroller.getHomeoffer);

route.post("/payment",payment)
route.delete("/delete/:id", isAdmin, deleteProduct);

module.exports=route