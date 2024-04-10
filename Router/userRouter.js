const express = require("express")
const userRouter = express.Router()
const {isUser,isBlocked} = require("../middleware/userloginmiddleware.js")

const {
    wishlistpage,
    addToWishlistController,
    removeFromWishList
}= require("../controllers/wishlistController.js")

const {
    cartpagefn,
    addtoCart,
    decQty,
    incQty,
    deleteFromCart,
    getcheckoutpagefn,
    orderPlacedEnd,
    orderPlaced,
    applyCoupon,
    storedApplycoupon
}= require("../controllers/cartController.js")

const {
    categoryFilterfn,
}=require("../controllers/categoryController.js")

const {
    productCategoryfn,
    ProductDetailsfn,
    search,
    sortPriceAscending,
    sortPriceDescending
}= require("../controllers/productController.js")

const { 
    userAddressfn,
    addAddressfn,
    saveaddressfn,
    editAddressfn,
    postEditAddressfn,
    deleteAddressfn,
    PrimaryCheckfn,
    notPrimaryCheckfn
}= require("../controllers/addressController.js")


//import from userController
const { 
    landingPagefn,
    userProfilefn,
    loginPagefn,
    forgetpage1fn,
    forgetpage4fn,
    forgetpage2fn,
    forgetpage3fn,
    insertUser,
    signupPagefn,
    sign2login,
    signupfn,
    logoutfn,
    optVerify,
    logincheckfn,
    ProfileEditpage,
    passChange,
    PostpassChange,
    postEditprofilefn
} = require("../controllers/userController.js")

const {
    allordersfn,
    singleorderfn,
    cancelOrder,
    returnRequest,
    genOrder,
    downloadInvoice
}= require("../controllers/orderController.js")

//login process
userRouter.get("/", landingPagefn)
userRouter.get("/login", loginPagefn)
userRouter.post("/login2", sign2login)
userRouter.get("/logout", logoutfn)
userRouter.post("/logincheck", logincheckfn)


// signup process
userRouter.get("/signup",signupPagefn)
userRouter.post("/userDetails",signupfn)
userRouter.post("/resentotp",insertUser)
userRouter.post("/otp",optVerify)


//pageing process
userRouter.get("/profile",isUser,isBlocked,userProfilefn)
userRouter.get("/profileEdit",isUser,isBlocked,ProfileEditpage)
userRouter.post('/PostprofileEdit/:id',isUser,isBlocked,postEditprofilefn)
userRouter.get('/passchange', isUser,isBlocked,passChange)
userRouter.patch('/changePassword',isUser,isBlocked,PostpassChange)


//address
userRouter.get("/address",isUser,isBlocked,userAddressfn)
userRouter.get("/addressAdd",isUser,isBlocked,addAddressfn)
userRouter.post('/saveAddress',isBlocked,saveaddressfn)
userRouter.get('/editAddress/:id',isUser,isBlocked,editAddressfn)
userRouter.post('/editAddress/:id',isBlocked, isUser,postEditAddressfn)
userRouter.get('/deleteAddress/:id',isUser,isBlocked,deleteAddressfn)
userRouter.get("/primary/:id",isBlocked,PrimaryCheckfn)
userRouter.get("/notPrimary/:id",isBlocked,notPrimaryCheckfn)


//forget password process
userRouter.get("/forget1",isBlocked,forgetpage1fn)
userRouter.post("/forget2",isBlocked,forgetpage2fn)
userRouter.post("/forget3",isBlocked,forgetpage3fn)
userRouter.post("/forget4",isBlocked,forgetpage4fn)
userRouter.post("/resenOTP",isBlocked, optVerify)


// product visibility process
userRouter.get("/productCategory", isBlocked,productCategoryfn)
userRouter.get("/filterCategory",isBlocked,categoryFilterfn)
userRouter.get('/productList/sort/priceAscending',isUser,isBlocked,sortPriceAscending)
userRouter.get('/productList/sort/priceDescending',isUser,isBlocked, sortPriceDescending)
userRouter.get("/productDetails/:id",isBlocked,ProductDetailsfn)
userRouter.post("/search",isBlocked,search)


// cart
userRouter.get("/cart/:id",isBlocked,isUser,cartpagefn)
userRouter.get("/cart",isBlocked,isUser,cartpagefn)
userRouter.post("/addto-cart/:id",isUser,isBlocked,addtoCart);
userRouter.put('/cart/decQty/:id',isBlocked,decQty)
userRouter.put('/cart/incQty/:id',isBlocked,incQty)
userRouter.delete('/cart/delete/:id',isBlocked,deleteFromCart);
userRouter.get("/checkout",isBlocked,getcheckoutpagefn)
userRouter.post("/checkout/applyCoupon",isBlocked,applyCoupon);
userRouter.post("/orders/storeDiscount",isBlocked,storedApplycoupon);       


//wishlist
userRouter.get('/wishlist', isBlocked,isUser,wishlistpage)
userRouter.get('/wishlist/:id', isBlocked,isUser,addToWishlistController) 
userRouter.delete('/wishlist/delete/:id', isBlocked,isUser,removeFromWishList) 


//order
userRouter.get("/orders",isUser,allordersfn)
userRouter.get("/orderStatus/:id",isBlocked,singleorderfn)
userRouter.post("/razorpayOrderCreated:id",isBlocked,isUser,genOrder)
userRouter.post('/checkout/orderPlaced',isBlocked,isUser,orderPlaced);
userRouter.all('/confirmOrder',isBlocked,isUser,orderPlacedEnd)
userRouter.put('/account/orderList/orderStatus/cancelOrder/:id',isBlocked,isUser,cancelOrder )
userRouter.put('/account/orderList/orderStatus/returnorder/:id',isBlocked,isUser,returnRequest)
userRouter.get('/account/orderList/orderStatus/downloadInvoice/:id',isBlocked,isUser,downloadInvoice)


//Main userRouter connect with Main page for connection
module.exports = userRouter
// Define a route for handling 404 errors






