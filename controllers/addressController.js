const addressCollection = require("../Model/addressModel")
const userCollection = require("../Model/userModel")




const userAddressfn = async (req,res)=>{
    let userInfo = req.session.userInfo
   let addressData = await addressCollection.find({
     userId:req.session.userInfo._id
   });
   if(addressData.length <= 0){
    addressData = false
   }

   
   res.render("user/addresspage", {
     currentUser: req.session.userInfo._id,
     addressData
   });
 }
 

 const addAddressfn = (req,res)=>{
 res.render("user/ADDaddress",{
 currentUser: req.session.currentUser
 })
 }

 
 const saveaddressfn= async (req,res)=>{
  req.session.email
   const user = await userCollection.findOne({email:req.session.email})
   const userAddress = {
     userId : user._id,
     name : req.body.name,
     Phone: req.body.Phone,
     Address: req.body.Address,
     State: req.body.State,
     City:req.body.City,
   }
   const newAddress = await addressCollection.insertMany([userAddress])
   const newAddress1 = await addressCollection.findOneAndUpdate({ _id: req.params.id },{primary:true});
    req.session.address = newAddress
    res.redirect('/address')
 }
 


 const editAddressfn = async (req,res)=>{
   req.session.userInfo;
   const existingAddress = await addressCollection.findOne({
     _id: req.params.id,
   });
   res.render("user/editAddress",{existingAddress})
 }
  


 const postEditAddressfn = async (req,res)=>{
   try {
     const address = {
       name: req.body.name,
       Phone: req.body.Phone,
       Address: req.body.Address,
       State: req.body.State,
       City: req.body.City,
     };
     await addressCollection.updateOne({ _id: req.params.id }, address);
     res.redirect("/address");
   } catch (error) {
     console.error(error);
   }
 }
 
 
 const deleteAddressfn =  async (req, res) => {
   try {
     await addressCollection.deleteOne({ _id: req.params.id });
     res.redirect("/address");
   } catch (error) {
     console.log(error);
   }
 }
 const PrimaryCheckfn = async (req, res) => {
  try {
    await addressCollection.findOneAndUpdate({ _id: req.params.id },{primary:true});
    res.redirect("back")
  } catch (error) {
    console.error(error);
  }
};

const notPrimaryCheckfn = async (req, res) => {
  try {
    await addressCollection.findOneAndUpdate({ _id: req.params.id },{primary:false});
    res.redirect("back")
  } catch (error) {
    console.error(error);
  }
};

 module.exports={
    deleteAddressfn,
    postEditAddressfn,
    editAddressfn,
    saveaddressfn,
    addAddressfn,
    userAddressfn,
    PrimaryCheckfn,
    notPrimaryCheckfn

}