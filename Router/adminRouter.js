const express = require("express")
const adminRoute = express();
const {isAdmin} = require("../middleware/adminMiddlewares");
const multer = require('multer')
const path = require('path')
const upload = require('../service/multer.js')




const {
    loadLogin,
    verifyLogin,
    adminHome,
    adminLogout,
    userListController,
    unblockUserController,
    blockUserController,
    dashboardData,
    getOrderDetails
}= require("../controllers/adminController.js")

const {
    categoriesPage,
    addCategoriesPage,
    addCategory,
    editCategory,
    editCategoriesPage,
    listCategory,
    unlistCategory,
}= require("../controllers/categoryController.js")

const {
    productlist,
    addProductPage,
    addProduct,
    editProductpage,
    editProduct,
    deleteProduct,
    unListProduct,
    listProduct
}= require("../controllers/productController.js")

const {
    orderManagement,
    changeStatusPending,
    changeStatusShipped,
    changeStatusDelivered,
    changeStatusReturn,
    changeStatusCancelled,
}= require('../controllers/orderController.js')


const {
    couponManagement,
    addCoupon,
    editCoupon,
    deleteCoupon
}= require("../controllers/couponController.js")

const {
    productOfferManagement,
    addOffer,
    editOffer,
    getCategoryOffer,
    addCategoryOffer,
    editCategoryOffer,
    editCategoryOfferStatus
}= require("../controllers/offerController.js")

const {
    salesReport,
    salesReportFilter,
    salesReportFilterCustom,
    salesReportDownloadPDF,
    salesReportDownload,
}= require("../controllers/salesReportController.js")


// login 
adminRoute.get('/',loadLogin);
adminRoute.post('/',verifyLogin);
adminRoute.get('/adminHome',isAdmin,adminHome)
adminRoute.get('/dashboardData',isAdmin,dashboardData )
adminRoute.get("/logout",adminLogout);


//user manage
adminRoute.get("/userManagement",isAdmin,userListController);
adminRoute.get("/unblock-user/:id",isAdmin, unblockUserController);
adminRoute.get("/block-user/:id",isAdmin,blockUserController);



// category
adminRoute.get('/categories',isAdmin,categoriesPage)
adminRoute.get('/addCategories',isAdmin,addCategoriesPage)
adminRoute.post('/categories/add',isAdmin,addCategory)
adminRoute.get('/categories/edit/:id',isAdmin,editCategory);
adminRoute.post('/editCategories/:id',isAdmin,editCategoriesPage)
adminRoute.post('/categories/list/:id', isAdmin,listCategory)
adminRoute.post('/categories/unlist/:id',isAdmin,unlistCategory)


//product list
adminRoute.get('/products',isAdmin,productlist)
adminRoute.get('/addProduct',isAdmin,addProductPage)
adminRoute.post('/addproduct',upload.any(),addProduct);
adminRoute.get('/productEdit/:id', isAdmin,editProductpage);
adminRoute.post('/editProduct/:id',isAdmin,upload.any(),editProduct)
adminRoute.get('/deleteProduct/:id',isAdmin,deleteProduct)
adminRoute.post('/unlist/:id',isAdmin, unListProduct)
adminRoute.post('/list/:id',isAdmin, listProduct)


// order 
adminRoute.get("/orderManagement",isAdmin, orderManagement);
adminRoute.get( "/orderManagement/pending/:id",isAdmin,changeStatusPending);
adminRoute.get("/orderManagement/shipped/:id",isAdmin,changeStatusShipped);
adminRoute.get("/orderManagement/delivered/:id",isAdmin,changeStatusDelivered);
adminRoute.get("/orderManagement/return/:id",isAdmin,changeStatusReturn);
adminRoute.get("/orderManagement/cancelled/:id",isAdmin,changeStatusCancelled);
adminRoute.get("/orderManagement/orderStatus/:id", isAdmin, getOrderDetails);


// coupon 
adminRoute.get("/couponManagement", isAdmin,couponManagement);
adminRoute.post("/couponManagement/addCoupon",isAdmin,addCoupon);
adminRoute.put("/couponManagement/editCoupon/:id", isAdmin,editCoupon);
adminRoute.delete("/couponManagement/deleteCoupon/:id", isAdmin,deleteCoupon);



// product offer
adminRoute.get("/productOfferManagement",isAdmin,productOfferManagement);
adminRoute.post("/productOfferManagement/addOffer",isAdmin,addOffer);
adminRoute.put("/productOfferManagement/editOffer/:id", isAdmin,editOffer);


// category offer
adminRoute.get("/category-offer-list", isAdmin,getCategoryOffer);
adminRoute.post("/add-category-offer", isAdmin,addCategoryOffer);
adminRoute.put("/edit-category-offer", isAdmin,editCategoryOffer);
adminRoute.get("/categoryoffer-status/:id", isAdmin,editCategoryOfferStatus);


//salesreport
adminRoute.get("/salesReport", isAdmin,salesReport);
adminRoute.post("/salesReport/filter", isAdmin,salesReportFilter);
adminRoute.post('/salesReport/filterCustom',isAdmin,salesReportFilterCustom)
adminRoute.get('/salesReport/download/pdf',isAdmin,salesReportDownloadPDF)
adminRoute.get("/salesReport/download/xlsx",isAdmin,salesReportDownload);


//Main userRouter connect with Main page for connection
module.exports = adminRoute