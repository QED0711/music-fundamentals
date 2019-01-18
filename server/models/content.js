
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


// METHODS

contentSchema.statics.reorderContents = async function(lessonId, id, position, cb){
    return new Promise(async (resolve) => {
        let contents = await this.find({lessonId});
        contents = contents.sort((a,b) => a.position - b.position);
        
        position = position > contents.length ? contents.length - 1 : position
        let oldPosition = contents.filter(x => x.id === id)[0].position;
        let movement = oldPosition - position;
        
        let newOrder = []
        
        if(movement > 0){ // moving position backwards
            
            for(let i = 0; i < contents.length; i++){
                if(i === oldPosition) continue;
                if(i === position){
                    newOrder.push(contents[oldPosition]);
                    newOrder[newOrder.length - 1].position = newOrder.length - 1
                    await newOrder[newOrder.length - 1].save();
                    newOrder.push(contents[i]);
                } else {
                    newOrder.push(contents[i]);
                }
                newOrder[newOrder.length - 1].position = newOrder.length - 1
                await newOrder[newOrder.length - 1].save();
            }
            
        } else if(movement < 0){ // moving forwards
            for(let i = 0; i < contents.length; i++){
                if(i === oldPosition) continue; 
                if(i === position){
                    newOrder.push(contents[i]);
                    newOrder[newOrder.length - 1].position = newOrder.length - 1
                    await newOrder[newOrder.length - 1].save();
                    newOrder.push(contents[oldPosition]);
                } else {
                    newOrder.push(contents[i]);
                }
                newOrder[newOrder.length - 1].position = newOrder.length - 1
                await newOrder[newOrder.length - 1].save();
            }
        }
        resolve (this.find({lessonId}))
    })
}



module.exports =  mongoose.model("Content", contentSchema);