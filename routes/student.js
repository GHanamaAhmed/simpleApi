const studentRouter = require('express').Router();
const { Promise } = require('mongoose');
const { Student, Teacher, EmailVerification, Session, Room, Attendance, Notifications } = require('../database/database');
const { schemaSignin, schemaStudent, schemaTeacher, schemaauth2, schemaauth, schemaJoinRoom, schemaStudentUpdate, shchemaResetPassword } = require('../validate/validate');
const nodemailer = require("nodemailer");
const { promises } = require('nodemailer/lib/xoauth2');
const fs=require("fs")
const path = require('path');
const handlebars = require('handlebars');
const signature=fs.readFileSync(path.join(process.cwd(),"signature.html"),"utf-8")
const template = handlebars.compile(signature);
const htmlToSend=(content)=>{
    let replacements = {
        content: content
    };
    return template(replacements);
}
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
                    finduser1 = await Student.findByIdAndUpdate(finduser1.id, { $set: { firstname: req.body.firstname, lastname: req.body.lastname, password: req.body.rpassword, department: req.body.department, faculte: req.body.faculte, specialist: req.body.specialist, year: req.body.year } }, { new: true })
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
                        user: process.env.EMAIL_USER ,
                        pass: process.env.EMAIL_PASS
                    }
                })
                let code = Math.floor(1000 + Math.random() * 9000);
                let mailOption = {
                    from: process.env.EMAIL_USER,
                    to: req.body.email,
                    subject: 'Authentcation Code',
                    text: 'Code : ' + code,
                    html:htmlToSend('Code : ' + code)
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
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                })
                let mailOption = {
                    from: process.env.EMAIL_USER,
                    to: req.body.email,
                    subject: 'Authentcation Code',
                    text: 'Code : ' + code,
                    html:htmlToSend('Code : ' + code)
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
                    if (findSession.status) {
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
                            const students = req.io.of('/students');
                            rooms.to(findSession.idRoom).emit('join', { firstname: findStudent.firstname, lastname: findStudent.lastname, idStudent: findStudent.id, specialist: findStudent.specialist, sex: findStudent.sex, email: findStudent.email });
                            students.to(findStudent.email).emit('add-r', findRoom)
                            res.json({
                                res: true,
                                mes: "Attended",
                                data: attandance
                            })
                        }
                    } else {
                        res.json({
                            res: false,
                            mes: "This room session has ended"
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
studentRouter.post("/joinCode", async (req, res) => {
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
            let findRoom = await Room.findOne({ code: req.body.code })
            if (findRoom != null) {
                let findSession = await Session.findOne({ idRoom: findRoom.id })
                if (findSession == null) {
                    res.json({
                        res: false,
                        mes: "This room session has ended"
                    })
                } else {
                    if (findSession.status) {
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
                            const students = req.io.of('/students');
                            rooms.to(findSession.idRoom).emit('join', { firstname: findStudent.firstname, lastname: findStudent.lastname, idStudent: findStudent.id, specialist: findStudent.specialist, sex: findStudent.sex });
                            students.to(findStudent.email).emit('add-r', findRoom)
                            res.json({
                                res: true,
                                mes: "Attended",
                                data: attandance
                            })
                        }
                    } else {
                        res.json({
                            res: false,
                            mes: "This room session has ended"
                        })
                    }

                }
            } else {
                res.json(
                    {
                        res: false,
                        mes: "This room does't exist"
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
studentRouter.post("/notification", async (req, res) => {
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
            let findNotification = await Notifications.find({ idStudent: findStudent.id })
            let find = await Promise.all(findNotification.map(async (e) => {
                let t = await Teacher.findById(e.idTeacher)
                return {
                    id: e.id,
                    idTeacher: e.idTeacher,
                    name: t.firstname + " " + t.lastname,
                    module: e.module,
                    date: e.date,
                    type: e.type,
                }
            }))
            res.json(
                {
                    res: true,
                    mes: "succsuful",
                    data: find
                }
            )

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
                let attandance = await Attendance.find({ idRoom: findRoom.id })
                let students = await Promise.all(attandance.map(async e => {
                    let student = await Student.findById(e.idStudent)
                    return { firstname: student.firstname, lastname: student.lastname, email: student.email, idStudent: student.id, specialist: student.specialist, sex: student.sex }
                }));
                res.json(
                    {
                        res: true,
                        mes: "succssful",
                        data: students,
                        room: findRoom
                    }
                )

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
studentRouter.post("/forgetpassword", async (req, res) => {
    const { error } = schemaauth2.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Student.find({ email: req.body.email })
            if (finduser.length <= 0) {
                res.json({
                    res: false,
                    mes: "Email not exist!"
                })
            } else {
                let finemil = await EmailVerification.find({ email: req.body.email })
                if (finemil.length > 0) {
                    let auth = await EmailVerification.find({ email: req.body.email, code: req.body.code })
                    if (auth.length > 0) {
                        res.json({
                            res: true,
                            mes: "Succeeful",
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
studentRouter.post("/resetPaswword", async (req, res) => {
    const { value, error } = shchemaResetPassword.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Student.find({ email: req.body.email })
            if (finduser.length < 0) {
                res.json({
                    res: false,
                    mes: "Account does not exist!"
                })
            } else {
                let finemil = await EmailVerification.find({ email: req.body.email })
                if (finemil.length > 0) {
                    let auth = await EmailVerification.find({ email: req.body.email, code: req.body.code })
                    if (auth.length > 0) {
                        await Student.findOneAndUpdate({ email: req.body.email }, { $set: { password: req.body.rpassword } })
                        await EmailVerification.deleteOne({ email: req.body.email })
                        res.json({
                            res: true,
                            mes: "Succeeful",
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
studentRouter.post("/authResetPassword", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Student.findOne({ email: req.body.email })
            if (finduser == null) {
                res.json({
                    res: false,
                    mes: "Email does't exsist!"
                })
            } else {
                let transport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                })
                let code = Math.floor(1000 + Math.random() * 9000);
                let mailOption = {
                    from: process.env.EMAIL_USER,
                    to: req.body.email,
                    subject: 'Authentcation Code',
                    text: 'Code : ' + code,
                    html:htmlToSend('Code : ' + code)
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
                    mes: "The code has been sent successfully"
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
module.exports = { studentRouter }