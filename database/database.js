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
        }
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
        createAt: {
            type: String,
            required: true
        }
    }
))
const Session = mongoose.model("Session", new mongoose.Schema(
    {
        idRoom: {
            type: String,
            required: true
        },
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
module.exports = { Student, Teacher, Specialist, EmailVerification,Room,Session,Attendance }
