const mongoose= require('mongoose')

const productSchema= new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    parentCategory:{
        type: String,
        required: true
    },
    productImage1:{
        type: String,
    },
    productImage2:{
        type: String,
    },
    productImage3:{
        type: String,
    },
    productPrice:{
        type: Number,
        required: true
    },
    productStock: {
        type: Number,
        required: true
    },
    stockSold: {
        type: Number,
        default: 0,
    },
    isListed: {
        type: Boolean,
        default: true
    },
    productOfferId: { type: mongoose.Types.ObjectId, default: null },
    productOfferPercentage: { type: Number, default: null },
    priceBeforeOffer: { type: Number, default: null },
    //category have to add
})

const productCollection= mongoose.model('products',productSchema)

module.exports= productCollection