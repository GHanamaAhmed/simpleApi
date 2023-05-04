var joi = require('joi');
//Schema signup validation up for Student
var schemaStudent=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    code:joi.number().required(),
    sex:joi.string().valid('Male', 'Female').required(),
    faculte: joi.string().required(),
    department : joi.string().required(),
    specialist : joi.string().required(),
    year : joi.string().required(),
})
var schemaStudentUpdate=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    rpassword:joi.string().max(20).min(8).required(),
    faculte: joi.string().required(),
    department : joi.string().required(),
    specialist : joi.string().required(),
    year : joi.string().required(),
})
//Schema signup validation up for Teacher
var schemaTeacher=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    code:joi.number().required(),
    sex:joi.string().valid('Male', 'Female').required(),
    specialist : joi.string().required(),
})
//Schema sgign validation in for users
var schemaSignin=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required()
})
//Schema sgign validation in for users
var schemaSpecialist=joi.object({
    faculte:joi.string().required(),
    department:joi.string().required(),
    specialist:joi.string().required()
})
var schemaauth=joi.object({
    email:joi.string().email().required(),
})
var schemaJoinRoom=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    qrcode:joi.string(),
    module:joi.string(),
    type:joi.string().valid('Cour', 'Td','Tp'),
    specialist:joi.string(),
    code:joi.number(),
    schoolYear:joi.string().valid('1 licence', '1 licence','2 licence','3 licence','1 master','2 master'),
})
var schemaeditRoom=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    idroom:joi.any()
})
var createCode=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    idroom:joi.any(),
    code:joi.number().required()
})

module.exports={createCode,schemaTeacher,schemaStudent,schemaSignin,schemaSpecialist,schemaauth,schemaJoinRoom,schemaeditRoom,schemaStudentUpdate}