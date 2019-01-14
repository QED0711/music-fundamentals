const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
    instructorId: String,
    type: {
        type: String,
        enum: [
            "reading",
            "interactive",
            "dictation"
        ]
    },
    title: String,
    description: String,
    published: Boolean,
    tags: [{type: String}]
})

module.exports = mongoose.model("Lesson", LessonSchema);