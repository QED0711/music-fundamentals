
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    type: {
        type: String,
        enum: [
            'paragraph', 
            'heading2', 
            'heading3',
            'nfPlayer',
            'nfInteractive',
            'image',
            'iframe',
            'bulletList',
            'numberedList'
        ],
        default: 'paragraph'
    },
    data: [{type: String}],
    lessonId: String,
    position: Number,
})

module.exports =  mongoose.model("Content", contentSchema);