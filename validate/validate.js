var joi = require('joi');
var schemaUser=joi.object({
    firstname:joi.string().required().min(1).max(20),
    lastname:joi.string().required().min(1).max(20),
    email:joi.string().email().required(),
    password:joi.string().max(20).min(8).required()
})
module.exports={schemaUser}