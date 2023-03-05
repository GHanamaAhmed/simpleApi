var joi = require('joi');
var schemaSignup=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required()
})
var schemaSignin=joi.object({
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required()
})
module.exports={schemaSignup,schemaSignin}