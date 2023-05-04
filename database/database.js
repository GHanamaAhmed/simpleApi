const { required } = require('joi');
const mongoose = require('mongoose');
//Schema DB for Student
const Student = mongoose.model("student", new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    faculte: {
        type: String,
        required: true
    }, department: {
        type: String,
        required: true
    },
    specialist: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
}))
//Schema DB for users
const Teacher = mongoose.model("teacher", new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    specialist: {
        type: String,
        required: true
    },
}))
const Specialist = mongoose.model("specialistes", new mongoose.Schema(
    {
        faculte: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        specialist: {
            type: String,
            required: true
        }
    }
))
const EmailVerification = mongoose.model("emailv", new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        code: {
            type: Number,
            required: true
        },
        // createAt: {
        //     type: Date,
        //     default: Date.now,
        //     expires:"2h",
        //     index:true
        // }
    }
))
const Room = mongoose.model("room", new mongoose.Schema(
    {
        qrCode: {
            type: String,
            required: true
        },
        code: {
            type: String,
        },
        idTeacher: {
            type: String,
            required: true
        },
        module: {
            type: String,
            required: true
        },
        type: {
            type: String,
        },
        createAt: {
            type: Date,
            default: new Date().toLocaleString()
        },
        schoolYear: {
            type: String,
        },
        specialist:{
            type: String
        }
    }
))
const Session = mongoose.model("Session", new mongoose.Schema(
    {
        idRoom: {
            type: String,
            required: true
        },
        isStatut: {
            type: Boolean,
            default: true
        },
        // createAt: {
        //     type: Date,
        //     default: Date.now,
        //     expires:"2h",
        //     index:true
        // }
    }
))
const Attendance = mongoose.model("attendance", new mongoose.Schema(
    {
        idRoom: {
            type: String,
            required: true
        },
        idStudent: {
            type: String,
            required: true
        },
    }
))
const Notifications = mongoose.model("notification", new mongoose.Schema(
    {
        idRoom: {
            type: String,
            required: true
        },
        idStudent: {
            type: String,
            required: true
        },
        idTeacher: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: new Date().toLocaleString(),
            required: true
        },
        module: {
            type: String,
            required: true
        },
    }
));
module.exports = { Student, Teacher, Specialist, EmailVerification, Room, Session, Attendance, Notifications }
