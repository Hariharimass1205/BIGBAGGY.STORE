const mongoose = require("mongoose")

//create schema (in which format data will go)
const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    Password: String,
    confirmPass : String,
    Phone : Number,
    is_admin: { 
        type: Number, 
        default: false
        },
    isBlocked: {
            type: Boolean,
            default: false,
          },
          ReferalCode:{
            type: String, 
            
          }
})

// model is a communicator for DB and node.js
const userModel = mongoose.model("userdbs",userSchema);

module.exports = userModel; 