const teacherRouter = require('express').Router();
const { Teacher, EmailVerification, Room, Session, Student, Notifications, Attendance } = require('../database/database');
const { schemaSignin, schemaStudent, schemaTeacher, schemaauth, schemaJoinRoom, schemaeditRoom } = require('../validate/validate');
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
                if (finduser1 != null) {
                    res.json({
                        res: true,
                        mes: "Sign in succssful",
                        data: finduser1
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
                        pass: "ebuzczrivdugpmua"
                    }
                })
                let code = Math.floor(1000 + Math.random() * 9000);
                let mailOption = {
                    from: "ghanamaahmed@gmail.com",
                    to: req.body.email,
                    subject: 'Authentcation Code',
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
                        pass: "ebuzczrivdugpmua"
                    }
                })
                let mailOption = {
                    from: "ghanamaahmed@gmail.com",
                    to: req.body.email,
                    subject: 'Authentcation Code',
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
            res.json(
                {
                    res: true,
                    mes: "succssful",
                    data: findteacher
                }
            )
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
            let findrooms = await Room.find({ qrCode: req.body.qrcode })
            if (findrooms.length > 0) {
                res.json(
                    {
                        res: false,
                        mes: "this qr code exist!",
                    }
                )
            } else {
                let room = await new Room(
                    {
                        idTeacher: findTeacher.id,
                        module: req.body.module || findTeacher.specialist,
                        qrCode: req.body.qrcode,
                        type: req.body.type || "undefine",
                        code: req.body.code || "undefine",
                        schoolYear: req.body.schoolYear || "undefine",
                        specialist: req.body.specialist || "undefine"
                    }
                )
                await room.save()
                let session = await new Session(
                    {
                        idRoom: room.id
                    }
                )
                await session.save()
                const students = req.io.of('/students');
                students.to(req.body.specialist).emit('create-room', room)
                let ModuleStudent = await Student.find({ specialist: req.body.specialist })
                for (let i = 0; i < ModuleStudent.length; i++) {
                    let newNotification = new Notifications(
                        {
                            idStudent: ModuleStudent[i].id,
                            idTeacher: findTeacher.id,
                            idRoom: room.id,
                            type: req.body.type || "undefine",
                            module: req.body.module || findTeacher.specialist,
                            date: new Date()
                        }
                    )
                    await newNotification.save()
                }
                res.json(
                    {
                        res: true,
                        mes: "Rom created successfully",
                        data: room
                    }
                )
            }
        }
    }
})
teacherRouter.post("/stoproom", async (req, res) => {
    const { error, value } = schemaeditRoom.validate(req.body)
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
            let room = await Room.findById(req.body.idroom)
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
    const { error, value } = schemaeditRoom.validate(req.body)
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
            await Notifications.find({ idRoom: req.body.idroom }).deleteMany()
            await Attendance.find({ idRoom: req.body.idroom }).deleteMany()
            await Room.findByIdAndDelete(req.body.idroom)
            res.json(
                {
                    res: false,
                    mes: "Deleted succssfully"
                }
            )
        }
    }
})
teacherRouter.delete("/deletrooms", async (req, res) => {
    const { error, value } = schemaeditRoom.validate(req.body)
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
            let idRooms = req.body.idroom
            await Promise.all(idRooms.map(async e => {
                await Notifications.find({ idRoom: e }).deleteMany()
                await Attendance.find({ idRoom: e }).deleteMany()
                await Room.findByIdAndDelete(e)
            }))
            res.json(
                {
                    res: false,
                    mes: "Deleted succssfully"
                }
            )
        }
    }
})
teacherRouter.post("/rooms", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
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
            let rooms = await Room.find({ idTeacher: findTeacher.id })
            res.json(
                {
                    res: true,
                    mes: "succssful",
                    data: rooms
                }
            )
        }
    }
})
teacherRouter.post("/sessions", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
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
            let rooms = await Room.find({ idTeacher: findTeacher.id })
            let sessions = await Promise.all(rooms.map(async e => {
                return await Session.findOne({ idRoom: e.id });
            }));
            res.json(
                {
                    res: true,
                    mes: "succssful",
                    data: sessions
                }
            )
        }
    }
})
module.exports = { teacherRouter }