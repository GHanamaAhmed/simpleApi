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
module.exports = { Users, Specialist}
