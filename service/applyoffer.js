const productOfferCollection = require("../Model/productOfferModel")
const categoryOffercollection = require("../Model/categoryOfferModel")
const productCollection = require("../Model/productModel")
const categorycollection = require('../Model/categoryModel')


const applyOffers = async () => {
    try {
      let productOfferCollectionData = await productOfferCollection.find({
        currentStatus: true,
      });
      let categoryOffercollectionData = await categoryOffercollection.find({
         isAvailable: true,
      }).populate("category");
      const categoryOfferSet = new Set(
        categoryOffercollectionData.map((offer) => offer.category.categoryName)
      );
      const productOfferSet = new Set(
        productOfferCollectionData.map((offer) => offer.productName)
      );
      let productCollectionData = await productCollection
        .find()
        .populate("parentCategory");
      for (const prod of productCollectionData) {
        const categoryName = prod.parentCategory;
        const productName = prod.productName;
       // const categoryId = prod.parentCategory.

        const categoryId = await  categorycollection.findOne({categoryName})
        let categoryIds = categoryId._id
        // Check if category name is present in categoryOffercollection and product name is present in productOfferCollection
        const isInCatOffer = categoryOfferSet.has(categoryName);
        const isInProdOffer = productOfferSet.has(productName);
        if (isInCatOffer && isInProdOffer) {
  
          await havingBothOffers(productName, categoryName, prod,categoryIds);
          
        } else if (isInCatOffer || isInProdOffer) {
          let availOffer = isInProdOffer ? "productOffer" : "categoryOffer";
          await havingSingleOffer(availOffer, productName, categoryName, prod,categoryIds);
        }
      }
    } catch (error) {
      console.log(
        "Error while applying the product offers in the product page:" + error
      );
    }
  };
  
  const havingBothOffers = async (productName, categoryName, prod,categoryIds) => {
    try {
      let prodOffer = await productOfferCollection.findOne({ productName });
      let catOffer = await categoryOffercollection.findOne({
        category:categoryIds
      }).populate("category");
      let maxOffer = Math.max(
        prodOffer.productOfferPercentage,
        catOffer.offerPercentage
      );
  
      if (prod.productOfferPercentage !== maxOffer) {
        let offerId;
        if (prodOffer.productOfferPercentage === maxOffer) {
          offerId = prodOffer._id;
        } else if (catOffer.offerPercentage === maxOffer) {
          offerId = catOffer._id;
        }
  
        let productPrice = Math.round(
          prod.priceBeforeOffer * (1 - maxOffer * 0.01)
        );
  
        result = await productCollection.updateOne(
          { _id: prod._id },
          {
            $set: {
              productPrice,
              productOfferId: offerId,
              productOfferPercentage: maxOffer,
            },
          }
        );
      }
    } catch (error) {
      console.log(
        "Error while cheking and updating the offers present in both :" + error
      );
    }
  };
  
  const havingSingleOffer = async (
    availOffer,
    productName,
    categoryIds,
    prod
  ) => {
    try {
      if (availOffer === "productOffer") {
        let prodOffer = await productOfferCollection.findOne({ productName });
        if (prod.productOfferPercentage !== prodOffer.productOfferPercentage) {
          let productPrice = Math.round(
            prod.priceBeforeOffer * (1 - prodOffer.productOfferPercentage * 0.01)
          );
  
          result = await productCollection.updateOne(
            { _id: prod._id },
            {
              $set: {
                productPrice,
                productOfferId: prodOffer._id,
                productOfferPercentage: prodOffer.productOfferPercentage,
              },
            }
          );
        }
      } else if (availOffer === "categoryOffer") {
        let catOffer = await categoryOffercollection.findOne({
          category:categoryIds
        })
        if (prod.productOfferPercentage !== catOffer.offerPercentage
        ) {
          let productPrice = Math.round(
            prod.priceBeforeOffer * (1 - catOffer.offerPercentage
                * 0.01)
          );
          result = await productCollection.updateOne(
            { _id: prod._id },
            {
              $set: {
                productPrice,
                productOfferId: catOffer._id,
                productOfferPercentage: catOffer.categoryOfferPercentage,
              },
            }
          );
        }
      }
    } catch (error) {
      console.log(
        "Error while applying offer for product holds single offer :" + error
      );
    }
  };

  module.exports = {applyOffers}