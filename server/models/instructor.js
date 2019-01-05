
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    name: String,
    email: String,
    password: String,
    authorization: String
})

module.exports =  mongoose.model("Instructor", instructorSchema);