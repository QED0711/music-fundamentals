
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt")
const SALT_WORK_FACTOR = 10;

const instructorSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    authorization: {type: String, required: true},
})

instructorSchema.pre("save", function(next){
    let instructor = this
    // only salt password if it has been modified or is new
    if(!instructor.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(instructor.password, salt, function(err, hash){
            if(err) return next.err;
            // override normal password with hased password
            instructor.password = hash
            next();
        })
    })
})

instructorSchema.methods.comparePassword = (instructorPassword, cb) => {
    bcrypt.compare(instructorPassword, this.password, function(err, isMatch){
        cb(null, isMatch)
    })
}

module.exports =  mongoose.model("Instructor", instructorSchema);