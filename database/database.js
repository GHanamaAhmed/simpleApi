const mongoose = require('mongoose');

//Schema DB for users
const Users = mongoose.model("users", new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
    },department :{
        type: String,
        required: true
    },
    specialist :{
        type: String,
        required: true
    },
    year :{
        type: String,
        required: true
    },
}))
const Specialist=mongoose.model("specialistes",new mongoose.Schema(
    {
        faculte:{
            type:String,
            required:true
        },
        department:{
            type:String,
            required:true
        },
        specialist:{
            type:String,
            required:true
        }
    }
))
const EmailVerification=mongoose.model("emailv",new mongoose.Schema(
    {
        email:{
            type:String,
            required:true
        },
        code:{
            type:Number,
            required:true
        }
    }
))
module.exports = { Users, Specialist,EmailVerification}
