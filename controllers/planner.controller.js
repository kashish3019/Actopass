
const planner = require("../models/planner.schema");
const path = require("path");
const fs = require("fs");

const addplanner = async (req, res) => {
    try {
        const Details = {
            img: req.file.filename,
        };
        await planner.create(Details);
        res.redirect("/product/getplanner")
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

const Updateplanner = async (req, res) => {
    try {
        const { _id } = req.body;
        const planners = await planner.findById(_id);

        if (!planners) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "planner not found",
                data: {},
            });
        }

        let updatedData = {};


        if (req.file) {
            if (planners.img) {
                const oldFilePath = path.join(__dirname, "..", "public", "images", planners.img);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updatedData.img = req.file.filename;
        }


        await planner.findByIdAndUpdate(_id, updatedData, { new: true });

        return res.redirect("/product/getplanner");
    } catch (error) {
        console.error("Error updating planner:", error);
        return res.status(400).json({
            status: false,
            code: 400,
            message: error.message,
            data: {},
        });
    }
};

const Deleteplanner = async (req, res) => {
    try {
        const { planner_id } = req.params; // Change from req.query to req.params
        const data = await planner.findByIdAndDelete(planner_id);

        if (!data) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: "Planner not found",
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
            message: "Error deleting planner",
            data: {},
        });
    }
};

const plannerget = async (req, res) => {
    try {
        const planners = await planner.find()
        res.render("plannerget", { planners });
    } catch (error) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: "Error fetching accounts",
            data: {}
        });
    }
};
const Addplanner = async (req, res) => {
    res.render('planneradd');
};

const plannerEdit = async (req, res) => {
    const { planner_id } = req.query;
    const planners = await planner.findOneAndUpdate(
        { _id: planner_id },
        req.body,
        { new: true }
    );
    res.render("planneredit", { planners });
};
const getHomeplanners = async (req, res) => {
    try {
        const planners = await planner.find();
        res.render("home", {
            planners: planners,
        });
    } catch (error) {
        return res.status(400).send({
            status: false,
            code: 400,
            error: "Error fetching planners",
            data: {}
        });
    }
};
module.exports = { addplanner, Updateplanner, Deleteplanner, Addplanner, plannerEdit, plannerget, getHomeplanners }