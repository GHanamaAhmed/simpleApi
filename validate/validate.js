var joi = require('joi');
//Schema sign validation up for users
var schemaSignup=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required(),
    code:joi.number().required(),
    faculte: joi.string().required(),
    department : joi.string().required(),
    specialist : joi.string().required(),
    year : joi.string().required(),
})
//Schema sgign validation in for users
var schemaSignin=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required()
})
var schemaSpecialist=joi.object({
    faculte:joi.string().required(),
    department:joi.string().required(),
    specialist:joi.string().required()
})
var schemaauth=joi.object({
    email:joi.string().email().required(),
})
module.exports={schemaSignup,schemaSignin,schemaSpecialist,schemaauth}