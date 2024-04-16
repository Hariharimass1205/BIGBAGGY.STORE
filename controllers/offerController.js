
const productCollection = require("../Model/productModel")
const categoryModel = require("../Model/categoryModel")
const productOfferCollection = require("../Model/productOfferModel");
const categoryOfferModel = require("../Model/categoryOfferModel")
const formatDate = require("../service/dateFormate");
const applyProductOffers =
  require("../service/applyProductOffers").applyProductOffer;
const applyCategoryOffer= require("../service/applyCategoryOffer").applyCategoryOffer;


   const  productOfferManagement = async (req, res) => {
    try {
      // updating the currentStatus field by checking with the current date
      let productOfferData = await productOfferCollection.find();
      productOfferData.forEach(async (v) => {
        await productOfferCollection.updateOne(
          { _id: v._id },
          {
            $set: {
              currentStatus:
                v.endDate >= new Date() && v.startDate <= new Date(),
            },
          }
        );
      });
      //sending the formatted date to the page
      productOfferData = productOfferData.map((v) => {
        v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
        v.endDateFormatted = formatDate(v.endDate, "YYYY-MM-DD");
        return v;
      });
      
      let productData = await productCollection.find({isListed:true});
      let categoryData = await categoryModel.find({isListed:true});
      res.render("admin/productOfferList", {
        productData,
        productOfferData,
        categoryData,
      });
    } catch (error) {
      console.error(error);
    }
  }


  const addOffer = async (req, res) => {
    try {
      //check if the product already has an offer applied
      let { productName } = req.body;
      console.log(req.body)
      let existingOffer = await productOfferCollection.findOne({ productName });
      console.log(existingOffer)
      if (!existingOffer) {
        //if offer for that particular product doesn't exist:
        let productData = await productCollection.findOne({productName });
        console.log(productData)
        let { productOfferPercentage, startDate, endDate } = req.body;
        await productOfferCollection.insertMany([
          {
            productId: productData._id,
            productName,
            productOfferPercentage,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        ]);
        await applyProductOffers("addOffer");
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const editOffer = async (req, res) => {
    try {
      let { productName } = req.body;
      let existingOffer = await productOfferCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });
      if (!existingOffer || existingOffer._id == req.params.id) {
        let { discountPercentage, startDate, expiryDate } =
          req.body;
        let updateFields = {
         productName,
         productOfferPercentage:Number( discountPercentage),
          startDate: new Date(startDate),
          endDate:new Date(expiryDate),
        };
        const hhh=await productOfferCollection.findByIdAndUpdate(
          req.params.id,
          updateFields
        );
        await applyProductOffers("editOffer");
        res.status(200).send({success:true})
        // res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error(error);
    }
  }




  const  getCategoryOffer = async (req, res) =>{
    try {
      const categories = await categoryModel.find();
      const offers = await categoryOfferModel.find().populate("category");
      applyCategoryOffer();
      res.render("admin/categoryOfferList", { categories, offers });
    } catch (error) {
      console.log(error);
    }
  }



  const addCategoryOffer =  async (req, res) => {
  try {
    const { category, offerPercentage, startDate, endDate } = req.body;
    const offerExist = await categoryOfferModel.findOne({ category });
    if (offerExist) {
      return res.status(500).send({ exist: true });
    }
    const offer = await new categoryOfferModel({
      category,
      offerPercentage,
      startDate,
      endDate,
    }).save();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false });
  }
}



const editCategoryOffer = async (req, res) => {
  try {
    const { id, offerPercentage, startDate, endDate } = req.body;

    const offer = await categoryOfferModel.findByIdAndUpdate(id, {
      offerPercentage,
      startDate,
      endDate,
    });
    return res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false });
  }
}



  const editCategoryOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await categoryOfferModel.findOne({ _id: id });
    if (offer.isAvailable) {
      await categoryOfferModel.findByIdAndUpdate(id, {
        isAvailable: false,
      });
    } else {
      await categoryOfferModel.findByIdAndUpdate(id, {
        isAvailable: true,
      });
    }
    res.redirect("/category-offer-list");
  } catch (error) {
    console.log(error);
  }
}

  module.exports=
  { 
    productOfferManagement,
    addOffer,
    editOffer,
    getCategoryOffer,
    addCategoryOffer,
    editCategoryOfferStatus,
    editCategoryOffer
  }