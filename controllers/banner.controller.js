
const banner = require("../models/banner.schema");
const path = require("path");
const fs = require("fs");

const addBanner = async (req, res) => {
    try {
      const Details = {
        img: req.file.filename,
      };
      await banner.create(Details);
      res.redirect("/product/getbanner")
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        code: 500,
        message: "Internal Server Error",
        data: {},
      });
    }
  };

  const Updatebanner = async (req, res) => {
    try {
        const { _id } = req.body;
        const banners = await banner.findById(_id);

        if (!banners) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "Banner not found",
                data: {},
            });
        }

        let updatedData = {};

       
        if (req.file) {
            if (banners.img) {
                const oldFilePath = path.join(__dirname, "..", "public", "images", banners.img);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updatedData.img = req.file.filename;
        }

       
        await banner.findByIdAndUpdate(_id, updatedData, { new: true });

        return res.redirect("/product/getbanner");
    } catch (error) {
        console.error("Error updating banner:", error);
        return res.status(400).json({
            status: false,
            code: 400,
            message: error.message,
            data: {},
        });
    }
};

  const Deletebanner = async (req, res) => {
    try {
      const { banner_id } = req.query;
      const data = await banner.findByIdAndDelete(banner_id);
      return res.status(200).send({
        status: true,
        code: 200,
        message: "Deleted Successfully",
        data: data, 
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        status: false,
        code: 400,
        error: "Error",
        data: {},
      });
    }
  };
  const bannerget = async (req, res) => {
    try {
      const banners = await banner.find()
      res.render("bannerget", {
        banners: banners,
      });
    } catch (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        error: "Error fetching accounts",
        data: {}
      });
    }
  };
  const Addbanner = async (req, res) => {
    res.render('banneradd');
  };
  
const bannerEdit = async (req, res) => {
    const { banner_id } = req.query;
    const banners = await banner.findOneAndUpdate(
      { _id: banner_id },
      req.body,
      { new: true }
    );
    res.render("banneredit", { banners });
  };
const getHomeBanners = async (req, res) => {
    try {
        const banners = await banner.find();
        res.render("home", {
            banners: banners,
        });
    } catch (error) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: "Error fetching banners",
            data: {}
        });
    }
};
  module.exports={addBanner,Updatebanner,Deletebanner,Addbanner,bannerEdit,bannerget,getHomeBanners}