const mongoose = require('mongoose');
const URL = "mongodb://127.0.0.1:27017/mobile";
mongoose.connect(URL);
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
module.exports = { Users }
