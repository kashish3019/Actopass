
const offer = require("../models/offer.schema");
const path = require("path");
const fs = require("fs");

const addoffer = async (req, res) => {
    try {
        const Details = {
            img: req.file.filename,
        };
        await offer.create(Details);
        res.redirect("/product/getoffer")
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

const Updateoffer = async (req, res) => {
    try {
        const { _id } = req.body;
        const offers = await offer.findById(_id);

        if (!offers) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "offer not found",
                data: {},
            });
        }

        let updatedData = {};


        if (req.file) {
            if (offers.img) {
                const oldFilePath = path.join(__dirname, "..", "public", "images", offers.img);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updatedData.img = req.file.filename;
        }


        await offer.findByIdAndUpdate(_id, updatedData, { new: true });

        return res.redirect("/product/getoffer");
    } catch (error) {
        console.error("Error updating offer:", error);
        return res.status(400).json({
            status: false,
            code: 400,
            message: error.message,
            data: {},
        });
    }
};

const Deleteoffer = async (req, res) => {
    try {
        const { offer_id } = req.params; 
        const data = await offer.findByIdAndDelete(offer_id);

        if (!data) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: "offer not found",
                data: {},
            });
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: "Deleted Successfully",
            data: data,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: false,
            code: 500,
            message: "Error deleting offer",
            data: {},
        });
    }
};
const Addoffer = async (req, res) => {
    res.render('offeradd');
};

const offerget = async (req, res) => {
    try {
        const offers = await offer.find()
        res.render("offerget", { offers });
    } catch (error) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: "Error fetching accounts",
            data: {}
        });
    }
};


const offerEdit = async (req, res) => {
    const { offer_id } = req.query;
    const offers = await offer.findOneAndUpdate(
        { _id: offer_id },
        req.body,
        { new: true }
    );
    res.render("offeredit", { offers });
};
const getHomeoffer = async (req, res) => {
    try {
        const offers = await offer.find();
        res.render("home", {
            offers: offers,
        });
    } catch (error) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: "Error fetching offer",
            data: {}
        });
    }
};
module.exports = { addoffer, Updateoffer,Addoffer, Deleteoffer, offerEdit, offerget, getHomeoffer }