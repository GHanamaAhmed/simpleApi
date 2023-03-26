const teacherRouter = require('express').Router();
const { Teacher, EmailVerification, Room, Session } = require('../database/database');
const { schemaSignin, schemaStudent, schemaTeacher, schemaauth } = require('../validate/validate');
const nodemailer = require("nodemailer");
const { date } = require('joi');


//Sign up Teacher
teacherRouter.post("/signup", async (req, res) => {
    const { value, error } = schemaTeacher.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
            if (finduser.length > 0) {
                res.json({
                    res: false,
                    mes: "Email is exist!"
                })
            } else {
                let finemil = await EmailVerification.find({ email: req.body.email })
                if (finemil.length > 0) {
                    let auth = await EmailVerification.find({ email: req.body.email, code: req.body.code })
                    if (auth.length > 0) {
                        let user = new Teacher(req.body)
                        await user.save()
                        await EmailVerification.deleteOne({ email: req.body.email })
                        res.json({
                            res: true,
                            mes: "Succeeful",
                            data: user
                        })
                    } else {
                        res.json({
                            res: false,
                            mes: "code not correct"
                        })
                    }
                } else {
                    res.json({
                        res: false,
                        mes: "you ignore auth"
                    })
                }

            }
        } catch (err) {
            res.json({
                res: false,
                mes: err
            })
        }
    }

})
//Sign in Teacher
teacherRouter.post("/signin", async (req, res) => {
    const { value, error } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
            if (finduser.length > 0) {
                let finduser1 = await Teacher.findOne({ email: req.body.email, password: req.body.password })
                if (finduser1 == 0) {
                    res.json({
                        res: true,
                        mes: "Sign in succssful",
                        data: finduser
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
            res.json({
                res: false,
                mes: err
            })
        }
    }

})
//Auth Teacher
teacherRouter.post("/auth", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
            if (finduser.length > 0) {
                res.json({
                    res: false,
                    mes: "Email is exist!"
                })
            } else {
                let transport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "ghanamaahmed@gmail.com",
                        pass: "uqkeeqfxhqbsiqmg"
                    }
                })
                let code = Math.floor(1000 + Math.random() * 9000);
                let mailOption = {
                    from: "ghanamaahmed@gmail.com",
                    to: req.body.email,
                    subject: 'Sending Email using Node.js',
                    text: 'Code : ' + code
                }
                transport.sendMail(mailOption, (err, info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                })
                let userIsExist = EmailVerification.find({ email: req.body.email })
                if ((await userIsExist).length > 0) {
                    await EmailVerification.deleteOne({ email: req.body.email })
                }
                let user = new EmailVerification({ email: req.body.email, code: code })
                await user.save()
                res.json({
                    res: true,
                    mes: "send code" + code
                })

            }
        } catch (err) {
            res.json({
                res: false,
                mes: err
            })
        }
    }

})
//reAuth Teacher
teacherRouter.post("/reauth", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
            if (finduser.length > 0) {
                res.json({
                    res: false,
                    mes: "Email is exist!"
                })
            } else {
                let code = Math.floor(1000 + Math.random() * 9000);
                let transport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "ghanamaahmed@gmail.com",
                        pass: "uqkeeqfxhqbsiqmg"
                    }
                })
                let mailOption = {
                    from: "ghanamaahmed@gmail.com",
                    to: req.body.email,
                    subject: 'Sending Email using Node.js',
                    text: 'Code : ' + code
                }
                transport.sendMail(mailOption, (err, info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                })
                await EmailVerification.updateOne({ email: req.body.email }, { $set: { code: code } })
                res.json({
                    res: true,
                    mes: "resend code: " + code
                })

            }
        } catch (err) {
            res.json({
                res: false,
                mes: err
            })
        }
    }

})
teacherRouter.post("/info", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findteacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (findteacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            res.json(findteacher)
        }
    }
})
teacherRouter.post("/createroom", async (req, res) => {
    const { error, value } = schemaJoinRoom.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findTeacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (findTeacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            let room = await new Room(
                {
                    createAt: new Date().toLocaleString(),
                    idTeacher: findTeacher.id,
                    module: findTeacher.specialist,
                    qrCode: req.body.qrcode
                }
            )
            await room.save()
            let session = await new Session(
                {
                    idRoom: room.id
                }
            )
            await session.save()
            res.json(
                {
                    res: true,
                    mes: "Rom created successfully",
                    data: room
                }
            )
        }
    }
})
teacherRouter.post("/stoproom", async (req, res) => {
    const { error, value } = schemaJoinRoom.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findTeacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (findTeacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            let room = await Room.findOne({ qrCode: req.body.qrcode })
            if (room == null) {
                res.json(
                    {
                        res: false,
                        mes: "This room not exist!"
                    }
                )
            } else {
                let session = await Session.findOne({ idRoom: room.id })
                if (session == null) {
                    res.json(
                        {
                            res: false,
                            mes: "This session is ended"
                        }
                    )
                } else {
                    await Session.deleteOne({ idRoom: room.id })
                    res.json({
                        res: true,
                        mes: "Session ended"
                    })
                }
            }
        }
    }
})
teacherRouter.delete("/deletroom", async (req, res) => {
    const { error, value } = schemaJoinRoom.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findTeacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (findTeacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            await Room.deleteOne({ qrCode: req.body.qrcode })
            res.json(
                {
                    res: false,
                    mes: "Deleted succssfully"
                }
            )
        }
    }
})
module.exports = { teacherRouter }