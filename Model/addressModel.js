const mongoose = require("mongoose")

//create address schema (in which format data will go)
const addressShcema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref:'userdbs' },
    name: String,
    Phone: Number,
    Address: String,
    State: String,
    City : String,
    primary:{ type :Boolean, default:false,}
})
// model is a communicator for DB and node.js
const addressCollection = mongoose.model("address", addressShcema)
module.exports = addressCollection