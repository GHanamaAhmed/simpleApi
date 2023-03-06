const usersRouter = require('express').Router();
const { Users } = require('../database/database');
const { schemaSignin, schemaSignup } = require('../validate/validate');
//Sign up
usersRouter.post("/signup", async (req, res) => {
    const { value,error } = schemaSignup.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Users.find({ email: req.body.email })
            if (finduser.length > 0) {
                res.json({
                    res: false,
                    mes: "Email is exist!"
                })
            } else {
                let user = new Users(req.body)
                await user.save()
                res.json({
                    res: true,
                    mes: "Succeeful"
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

})
//Sign in
usersRouter.post("/signin", async (req, res) => {
    const { value, error } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Users.find({ email: req.body.email })
            if (finduser.length > 0) {
                let finduser1 = await Users.find({ email: req.body.email, password: req.body.password })
                if (finduser1.length > 0) {
                    res.json({
                        res: true,
                        mes: "Sign in succssful"
                    })
                } else {
                    res.json({
                        res: false,
                        mes: "Password not correct!"
                    })
                }
            } else {
                res.json({
                    res: false,
                    mes: "Email not exist!"
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

})
module.exports={usersRouter}