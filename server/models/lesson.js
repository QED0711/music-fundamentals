const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
    instructorId: String,
    title: String,
    description: String,
    tags: [{type: String}]
})

module.exports = mongoose.model("Lesson", LessonSchema);