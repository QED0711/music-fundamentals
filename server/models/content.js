
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    type: String,
    data: String
})

module.exports =  mongoose.model("Content", contentSchema);