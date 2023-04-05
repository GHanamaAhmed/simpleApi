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
    qrcode:joi.string().required(),
    module:joi.string(),
    type:joi.string().valid('Cour', 'Td','Tp'),
})
var schemaeditRoom=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    idroom:joi.string()
})
module.exports={schemaTeacher,schemaStudent,schemaSignin,schemaSpecialist,schemaauth,schemaJoinRoom,schemaeditRoom}