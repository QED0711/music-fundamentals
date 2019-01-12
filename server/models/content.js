
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    type: {
        type: String,
        enum: [
            'paragraph', 
            'heading1', 
            'heading2',
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
})

module.exports =  mongoose.model("Content", contentSchema);