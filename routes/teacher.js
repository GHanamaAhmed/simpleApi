const teacherRouter = require('express').Router();
const e = require('express');
const { Teacher, EmailVerification, Room, Session, Student, Notifications, Attendance, Specialist } = require('../database/database');
const { schemaSignin, schemaTeacher, schemaauth2, schemaSendStudent, shchemaResetPassword, schemaSendToAllStudent, schemasps, schemaauth, schemaJoinRoom, schemaeditRoom, schemaRemoveStudent } = require('../validate/validate');
const nodemailer = require("nodemailer");
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
teacherRouter.post("/allSeasons", async (req, res) => {
    const { error, value } = schemaSignin.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        const teacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (teacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            const rooms = await Room.find({ idTeacher: teacher.id })
            const attendences = await Promise.all(rooms.map(async e => {
                const att = await Attendance.find({ idRoom: e.id })
                const students = await Promise.all(att.map(async e => {
                    return await Student.findById(e.idStudent)
                }))
                let obj = {
                    room: e,
                    attendence: students
                }
                return obj
            }))
            res.json({
                res: true,
                mes: "succssful",
                data: attendences
            })
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
                        code: req.body.code,
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
//remove students from attendence
teacherRouter.delete("/removeStudents", async (req, res) => {
    const { error } = schemaRemoveStudent.validate(req.body)
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
            let idStudents = req.body.idstudent
            await Promise.all(idStudents.map(async e => {
                await Attendance.find({ idStudent: e, idRoom: req.body.idroom }).deleteMany()
            }))
            const rooms = req.io.of('/rooms');
            rooms.to(req.body.idroom).emit('removes', { idStudent: idStudents, idRoom: req.body.idroom });
            res.json({
                res: true,
                mes: "Students removed successfully"
            })
        }
    }
})
teacherRouter.delete("/removeStudent", async (req, res) => {
    const { error } = schemaRemoveStudent.validate(req.body)
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
            await Attendance.find({ idStudent: req.body.idstudent, idRoom: req.body.idroom }).deleteMany()
            const rooms = req.io.of('/rooms');
            rooms.to(req.body.idroom).emit('remove', { idStudent: req.body.idstudent, idRoom: req.body.idroom });
            res.json({
                res: true,
                mes: "Students removed successfully"
            })
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
                    await Session.findByIdAndUpdate(session.id, { $set: { status: false } })
                    res.json({
                        res: true,
                        mes: "Session ended"
                    })
                }
            }
        }
    }
})
teacherRouter.post("/startroom", async (req, res) => {
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
                    await Session.findByIdAndUpdate(session.id, { $set: { status: true } })
                    res.json({
                        res: true,
                        mes: "Session started"
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
                    res: true,
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
                    res: true,
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
teacherRouter.post("/getStudents", async (req, res) => {
    const { error } = schemasps.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        let all = []
        let specialist = req.body.specialist
        let students = await Promise.all(specialist.map(async e => {
            let l = e.toLowerCase()
            return await Student.find({ specialist: l })
        }))
        students.forEach(e => {
            e.forEach(e1 => {
                all.push(e1)
            })
        })
        res.json(
            {
                res: true,
                mes: "succssful",
                data: all
            }
        )
    }
})
teacherRouter.post("/sendMessage", async (req, res) => {
    const { error } = schemaSendStudent.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        const teacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (teacher == null) {
            res.json({
                res: false,
                mes: "Email or password not correct!"
            })
        } else {
            const student = await Student.findById(req.body.idStudent)
            if (student == null) {
                res.json({
                    res: false,
                    mes: "Student not found!"
                })
            } else {

                const Messege1 = `Dear ${student.lastname} ${student.firstname} , I hope this message finds you well. I noticed that you were absent from ${req.body.module} class recently, and I wanted to reach out and check in with you. If you have any questions or concerns about the course material, please don't hesitate to let me know. I am here to support you and help you succeed.Best regards,${teacher.lastname} ${teacher.firstname} Please dont reply to this email. you contact with your teacher by email: ${teacher.email}`
                const Message2 = `Dear ${student.lastname} ${student.firstname} , I am writing to remind you of the importance of attending all classes regularly. Missing even one in the ${req.body.module} class  can have an impact on your academic performance and make it difficult to keep up with the ${req.body.module} course material. Please make every effort to attend all remaining classes and to catch up on any material you may have missed. Sincerely,${teacher.lastname} ${teacher.firstname} Please dont reply to this email. you contact with your teacher by email: ${teacher.email}`
                const Message3 = `Dear ${student.lastname} ${student.firstname} , It has come to my attention that you have been absent ${req.body.absent} times from ${req.body.module} classes without any valid reason. Your frequent absences have not gone unnoticed, and I am disappointed to inform you that your behavior is unacceptable. Attendance is mandatory, and your lack of commitment is not only disrespectful to me but also to your fellow students. As a result of your continued absences, I am recommending your expulsion from the course. Please be aware that this decision is final, and you will not be able to re-enroll in the course. I wish you the best of luck in your future endeavors. Sincerely,${teacher.lastname} ${teacher.firstname} Please dont reply to this email. you contact with your teacher by email: ${teacher.email}`
                const Message4 = `Dear ${student.lastname} ${student.firstname} , I am writing to inform you that you have been expelled from the ${req.body.module} course due to your continued absences. You have missed ${req.body.absent} classes , and your behavior is unacceptable. Attendance is mandatory, and your lack of commitment is not only disrespectful to me but also to your fellow students. Please be aware that this decision is final, and you will not be able to re-enroll in the course. I wish you the best of luck in your future endeavors. Sincerely,${teacher.lastname} ${teacher.firstname} Please dont reply to this email. you contact with your teacher by email: ${teacher.email}`;
                let transport = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "ghanamaahmed@gmail.com",
                        pass: "ebuzczrivdugpmua"
                    }
                })
                let mailOption
                if (req.body.absent == 1) {
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.email,
                        subject: 'Checking in on your progress ',
                        text: Messege1
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else if (req.body.absent == 2) {
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.email,
                        subject: 'Reminder about the importance of attendance ',
                        text: Message2
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else if (req.body.absent == 4 || req.body.absent == 3) {
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.email,
                        subject: 'Concerns about your attendance and course enrollment',
                        text: Message3
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else {
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.email,
                        subject: 'Concerns about your attendance and course enrollment',
                        text: Message4
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })

                }
                res.json({
                    res: true,
                    mes: "succssful"
                })
            }
        }

    }
})

teacherRouter.post("/sendtoallstudents", async (req, res) => {
    const { error } = schemaSendToAllStudent.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        var teacher = await Teacher.findOne({ email: req.body.email, password: req.body.password })
        if (teacher == null) {
            res.json({
                res: false,
                mes: "email or password is wrong"
            })
        } else {
            const st = req.body.student
            let studentss = await Promise.all(st.map(async e => {
                let s = await Student.findById(e.id)
                return {
                    absent: e.absent,
                    st: s
                }
            }))
            let transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "ghanamaahmed@gmail.com",
                    pass: "ebuzczrivdugpmua"
                }
            })
            let mailOption
            studentss.forEach(async (student) => {
                let Messege1 = `Dear ${student.st.lastname} ${student.st.firstname} , I hope this message finds you well. I noticed that you were absent from class recently, and I wanted to reach out and check in with you. If you have any questions or concerns about the course material, please don't hesitate to let me know. I am here to support you and help you succeed.Best regards,${teacher.lastname} ${teacher.firstname} `
                if (student.absent == 1) {
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.st.email,
                        subject: 'Checking in on your progress ',
                        text: Messege1
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else if (student.absent == 2) {
                    let Message2 = `Dear ${student.st.lastname} ${student.st.firstname} , I am writing to remind you of the importance of attending all classes regularly. Missing even one class can have an impact on your academic performance and make it difficult to keep up with the course material. Please make every effort to attend all remaining classes and to catch up on any material you may have missed. Sincerely,${teacher.lastname} ${teacher.firstname}`
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.st.email,
                        subject: 'Reminder about the importance of attendance ',
                        text: Message2
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else if (student.absent == 4 || student.absent == 3) {
                    let Message3 = `Dear ${student.st.lastname} ${student.st.firstname} , It has come to my attention that you have been absent from ${req.body.module} classes without any valid reason. Your frequent absences have not gone unnoticed, and I am disappointed to inform you that your behavior is unacceptable. Attendance is mandatory, and your lack of commitment is not only disrespectful to me but also to your fellow students. As a result of your continued absences, I am recommending your expulsion from the course. Please be aware that this decision is final, and you will not be able to re-enroll in the course. I wish you the best of luck in your future endeavors. Sincerely,${teacher.lastname} ${teacher.firstname}`
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.st.email,
                        subject: 'Concerns about your attendance and course enrollment',
                        text: Message3
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })
                } else {
                    let Message4 = `Dear ${student.st.lastname} ${student.st.firstname} , I am writing to inform you that you have been expelled from the ${req.body.module} course due to your continued absences. You have missed ${student.absent} classes , and your behavior is unacceptable. Attendance is mandatory, and your lack of commitment is not only disrespectful to me but also to your fellow students. Please be aware that this decision is final, and you will not be able to re-enroll in the course. I wish you the best of luck in your future endeavors. Sincerely,${teacher.lastname} ${teacher.firstname} Please dont reply to this email. you contact with your teacher by email: ${teacher.email}`;
                    mailOption = {
                        from: "ghanamaahmed@gmail.com",
                        to: student.st.email,
                        subject: 'Concerns about your attendance and course enrollment',
                        text: Message4
                    }
                    transport.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    })

                }
            })
            res.json({
                res: true,
                mes: "succssful"
            })

        }
    }
})

teacherRouter.post("/forgetpassword", async (req, res) => {
    const { error } = schemaauth2.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
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
teacherRouter.post("/resetPaswword", async (req, res) => {
    const { value, error } = shchemaResetPassword.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })
    } else {
        try {
            let finduser = await Teacher.find({ email: req.body.email })
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
                        Teacher.findOneAndUpdate({ email: req.body.email }, {  password: req.body.rpassword}, { upsert:true})
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
teacherRouter.post("/authResetPassword", async (req, res) => {
    const { value, error } = schemaauth.validate(req.body)
    if (error) {
        res.json({
            res: false,
            mes: error.message
        })

    } else {
        try {
            let finduser = await Teacher.findOne({ email: req.body.email })
            if (finduser == null) {
                res.json({
                    res: false,
                    mes: "Email does't exsist!"
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
module.exports = { teacherRouter }