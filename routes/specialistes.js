const specialistesRouter = require('express').Router();
const { json } = require('body-parser');
const { Specialist } = require('../database/database');
const { schemaSpecialist } = require('../validate/validate');
specialistesRouter.post("/add", async (req, res) => {
    let { faculte, department, specialist } = req.body
    const { error, value } = schemaSpecialist.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let sp = await Specialist.find({ faculte: faculte, department: department, specialist: specialist })
            if (sp.length > 0) {
                res.json({
                    res: false,
                    mes: "this specialis is exist!"
                })
            } else {
                await new Specialist({ department: department, faculte: faculte, specialist: specialist }).save()
                res.json({
                    res: true,
                    mes: "add succssful"
                })
            }
        } catch (error) {
            console.log(error);
        }

    }
})
specialistesRouter.get("/", async (req, res) => {
    let { f, d, s } = req.query
    try {
        let sp;
        if (f != null && d != null && s != null) {
            sp = await Specialist.find({ faculte: f, department: d, specialist: s })
        } else if (f == null && d != null && s != null) {
            sp = await Specialist.find({ department: d, specialist: s })
        } else if (f != null && d == null && s != null) {
            sp = await Specialist.find({ faculte: f, specialist: s })
        } else if (f != null && d != null && s == null) {
            sp = await Specialist.find({ faculte: f, department: d })
        } else if (f != null && d == null && s == null) {
            sp = await Specialist.find({ faculte: f })
        } else if (f == null && d != null && s == null) {
            sp = await Specialist.find({ department: d })
        } else if (f == null && d == null && s != null) {
            sp = await Specialist.find({ specialist: s })
        } else {
            sp = await Specialist.find({})
        }
        console.log(sp);
        res.json(
            sp
        )
    } catch (error) {
        console.log(error);
    }
})
module.exports = {
    specialistesRouter
}