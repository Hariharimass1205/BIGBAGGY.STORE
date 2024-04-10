const mongoose =  require("mongoose")
const DBconnect =  async ()=>{
    try {
        await mongoose.connect("mongodb+srv://Hariharan:Hariharan0404@cluster0.dve9hja.mongodb.net/Project1");
        console.log("successfully connected to database");
    } catch (error) {
        console.log("DB not Connected")
        console.log(error)
    }
}
module.exports = DBconnect;
