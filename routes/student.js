const studentRouter = require('express').Router();
const { Student, Teacher, EmailVerification, Session, Room, Attendance } = require('../database/database');
const { schemaSignin, schemaStudent, schemaTeacher, schemaauth, schemaJoinRoom, schemaStudentUpdate } = require('../validate/validate');
const nodemailer = require("nodemailer");
//Sign up Student
studentRouter.post("/signup", async (req, res) => {
    const { value, error } = schemaStudent.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Student.findOne({ email: req.body.email })
            if (finduser != null) {
                res.json({
                    res: false,
                    mes: "Email is exist!"
                })
            } else {
                let finemil = await EmailVerification.find({ email: req.body.email })
                if (finemil.length > 0) {
                    let auth = await EmailVerification.find({ email: req.body.email, code: req.body.code })
                    if (auth.length > 0) {
                        let user = new Student(req.body)
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
//Sign in Student
studentRouter.post("/signin", async (req, res) => {
    const { value, error } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Student.findOne({ email: req.body.email })
            if (finduser != null) {
                let finduser1 = await Student.findOne({ email: req.body.email, password: req.body.password })
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

//Sign in Student
studentRouter.post("/update", async (req, res) => {
    const { value, error } = schemaStudentUpdate.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Student.findOne({ email: req.body.email })
            if (finduser != null) {
                let finduser1 = await Student.findOne({ email: req.body.email, password: req.body.password })
                if (finduser1 != null) {
                    finduser1 = await Student.findByIdAndUpdate(finduser1.id, { $set: { firstname: req.body.firstname, lastname: req.body.lastname, password: req.body.password, department: req.body.department, faculte: req.body.faculte, specialist: req.body.specialist, year: req.body.year } })
                    res.json({
                        res: true,
                        mes: "Update succssful",
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
//Auth Student
studentRouter.post("/auth", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Student.find({ email: req.body.email })
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
//reAuth Student
studentRouter.post("/reauth", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Student.find({ email: req.body.email })
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

studentRouter.post("/info", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findStudent = await Student.findOne({ email: req.body.email, password: req.body.password })
        if (findStudent == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            res.json(findStudent)
        }
    }
})

studentRouter.post("/joinroom", async (req, res) => {
    const { error, value } = schemaJoinRoom.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findStudent = await Student.findOne({ email: req.body.email, password: req.body.password })
        if (findStudent == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            let findRoom = await Room.findOne({ qrCode: req.body.qrcode })
            if (findRoom != null) {
                let findSession = await Session.findOne({ idRoom: findRoom.id })
                if (findSession == null) {
                    res.json({
                        res: false,
                        mes: "This room session has ended"
                    })
                } else {
                    let finattandance = await Attendance.findOne({ idRoom: findSession.idRoom, idStudent: findStudent.id });
                    if (finattandance != null) {
                        res.json({
                            res: true,
                            mes: "Attended",
                            data: finattandance
                        })
                    } else {
                        let attandance = new Attendance({ idRoom: findSession.idRoom, idStudent: findStudent.id })
                        await attandance.save()
                        const rooms = req.io.of('/rooms');
                        rooms.to(findSession.idRoom).emit('join', { firstname: findStudent.firstname, lastname: findStudent.lastname, idStudent: findStudent.id });
                        res.json({
                            res: true,
                            mes: "Attended",
                            data: attandance
                        })
                    }
                }
            } else {
                res.json(
                    {
                        res: false,
                        mes: "This room not exist"
                    }
                )
            }
        }
    }
})
studentRouter.post("/attandance", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let findStudent = await Student.findOne({ email: req.body.email, password: req.body.password })
        if (findStudent == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            let findAttendance = await Attendance.find({ idStudent: findStudent.id })
            if (findAttendance.length <= 0) {
                res.json({
                    res: false,
                    mes: "Student not found!"
                })
            } else {
                let findRoom = await Promise.all(findAttendance.map(async (e) => await Room.findById(e.idRoom)))
                res.json(
                    {
                        res: true,
                        mes: "succsuful",
                        data: findRoom
                    }
                )
            }
        }
    }
})
studentRouter.get("/session/:idroom", async (req, res) => {
    if (!req.params.idroom) {
        res.json({
            res: false,
            mes: "idRoom is required!"
        })
    } else {
        if (req.params.idroom.match(/^[0-9a-fA-F]{24}$/)) {
            let findRoom = await Room.findById(req.params.idroom)
            if (findRoom == null) {
                res.json({
                    res: false,
                    mes: "The room does not exist!"
                })
            } else {
                let findSession = await Session.findOne({ idRoom: findRoom.id })
                if (findSession == null) {
                    res.json({
                        res: false,
                        mes: "The room session has be ended"
                    })
                } else {
                    let attandance = await Attendance.find({ idRoom: findSession.idRoom })
                    let students = await Promise.all(attandance.map(async e => {
                        let student = await Student.findById(e.idStudent)
                        return { firstname: student.firstname, lastname: student.lastname, idStudent: student.id }
                    }));
                    res.json(
                        {
                            res: true,
                            mes: "succssful",
                            data: students
                        }
                    )
                }
            }
        } else {
            res.json(
                {
                    res: false,
                    mes: `${req.params.idroom} is not a valid ObjectId`,
                }
            )
        }
    }
})
module.exports = { studentRouter }