const {Router}=require("express")
const verifyToken=require("../middleware/isauth")
const isAdmin = require("../middleware/admin")
const{create,createBy,productpage,getuser, shop, carts, cartfind,getcart,updatecart, payment, home, allproduct, filltercategory, pricefilter, singlepage, admin, search, deleteProduct, updateProduct, productUpdate, editProductPage, about}=require("../controllers/product.controllers")
const route=Router()
const multer=require("multer")

const store = multer.diskStorage({
    destination: "public/images",
    filename: (req, File, cb) => {
      cb(null, Date.now() + File.originalname);
    },
  });
  const upload = multer({
    storage: store,
  }).single("img");

route.get("/home",verifyToken,home)
route.get("/shop",verifyToken,shop)
route.get("/about",about)
route.get("/",create)
route.post("/productpage",isAdmin,createBy)
route.get("/productpage",isAdmin,productpage)
route.post("/productupdate",productUpdate)

route.get("/admin",verifyToken,admin)
route.get("/getuser",getuser)
route.get("/edit/:id", isAdmin, editProductPage);


route.post("/cart",verifyToken,carts)
route.get("/cart",getcart)
route.get("/cartfind",verifyToken,cartfind)
route.patch("/cart/update/:id",verifyToken,updatecart)
route.get("/allproduct",allproduct)
route.get("/singlepage/:id",singlepage)
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

route.post("/payment",payment)
route.delete("/delete/:id", isAdmin, deleteProduct);

module.exports=route