const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname:{
        type:String,
        // required:true,
        trim:true
    },
    lastname:{
        type:String,
        // required:true,
        trim:true
    },
    contactNumber:{
        type:Number,
        // required:true,
        // unique:true
    },
    email:{
        type:String,
        // required:true,
        // unique:true
    },
    password:{
        type:String,
        // required:true,
    },
    uid:{
        type:Number,
        // required:true,
    },
    accounttype:{
        type:String,
        enum:["Admin","Voter","Candidate"]
    },
   
    additiondetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    },
    Image:{
        type:String,
        require:true
    },
    token:{
        type:String,

    },
    resetpasswordexpires:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("User",UserSchema);