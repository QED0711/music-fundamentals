
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
            'list',
            'link',
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

contentSchema.statics.removeAndReorderContents = function(lessonId, id, position){
    return new Promise(async (resolve) => {
        let contents = await this.find({lessonId});
        let reorderedContents = [];
        for(let content of contents){
            // if content is the content we want to remove:
            // remove it from the DB and exclude it from the return results
            if(content.id === id){
                content.remove();
            } else {
                // If content is not the tart content to remove:
                // Check to see if wee need to adjust its position (it had a position greater than the target content)
                if(content.position > position){
                    content.position -= 1;
                    content.save();
                }
                // no matter what, push the non-target content to the return results
                reorderedContents.push(content)

            }


        }
        resolve(reorderedContents);
    })
}


// contentSchema.statics.deleteByLessonId = async function(lessonId){
//     let contents = await this.find({lessonId});
//     for(content of contents){
//         content.remove();
//     }
// }


module.exports =  mongoose.model("Content", contentSchema);