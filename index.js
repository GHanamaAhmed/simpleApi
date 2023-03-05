const express = require('express');
const bodyPparser = require('body-parser');
const { Users } = require('./database/database');
const { schemaSignin, schemaSignup } = require('./validate/validate');
const helmet = require('helmet');
const mongoose = require('mongoose');
const app = express();
const url = "mongodb://127.0.0.1:27017/mobile";
mongoose.set("strictQuery", false)
const connectDB = async () => {
    try {
        await mongoose.connect(url)
        console.log("Local DB")
    } catch (error1) {
        try {
            await mongoose.connect(process.env.MONGO_URI)
            console.log("Connect succssful");
        } catch (error2) {
            console.log(error2);
            process.exit(1)
        }
    }
}

const PORT = 8080;
app.use(helmet())
app.use(bodyPparser.urlencoded({ extended: true }))
app.post("/users/signup", async (req, res) => {
    const { value, err } = schemaSignup.validate(req.body)
    if (err) {
        res.json({
            res: false,
            mes: err.message
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
        } catch (error) {
            console.log(error);
        }
    }

})
app.post("/users/signin", async (req, res) => {
    const { value, err } = schemaSignin.validate(req.body)
    if (err) {
        res.json({
            res: false,
            mes: err.message
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
        } catch (error) {
            console.log(error);
        }
    }

})
connectDB().then(() => {
    app.listen(process.env.PORT || PORT)
})

