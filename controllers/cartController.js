const categoryCollection = require("../Model/categoryModel");
const productCollection = require("../Model/productModel");
const userCollection = require("../Model/userModel");
const cartCollection = require("../Model/cartModel");
const orderCollection = require("../Model/orderModel");
const addressCollection = require("../Model/addressModel");  
const couponCollection = require("../Model/couponModel.js");
const walletCollection = require("../Model/walletModel.js")


  const grandTotal = async(req)=>{
    try {
      let userCartData = await cartCollection
        .find({ userId: req.session.userInfo._id })
        .populate("productId");
      let grandTotal = 0;
      for (const v of userCartData) {
        grandTotal += v.productId.productPrice * v.productQuantity;
        await cartCollection.updateOne(
          { _id: v._id },
          {
            $set: {
              totalCostPerProduct: v.productId.productPrice * v.productQuantity,
            },
          }
        );
      }
      userCartData = await cartCollection
        .find({ userId: req.session.userInfo._id })
        .populate("productId");
      req.session.grandTotal = grandTotal;
      return JSON.parse(JSON.stringify(userCartData));
    } catch (error) {
      console.log(error);
    }
  }


  const cartpagefn = async (req, res) => {
    try {
      const userInfo = req.session?.userInfo
      let userCartData = await grandTotal(req);

      let empty;
      userCartData == 0 ? (empty = true) : (empty = false);
      res.render("user/cartpage", {
        user: req.session?.userInfo,
        userCartData,
        grandTotal: req.session.grandTotal,
        empty,
      });
    } catch (error) {
      console.error(error);
    }
  };



  const addtoCart = async (req, res) => {
    try {
      let existingProduct = null;
      existingProduct = await cartCollection.findOne({
        userId: req.session.userInfo._id,
        productId: req.params.id,
      });

      const productss = await productCollection.findOne({_id: req.params.id})
      if (existingProduct && existingProduct.productQuantity <productss.productStock ) {
        await cartCollection.updateOne(
          { _id: existingProduct._id },
          { $inc: { productQuantity: 1 } }
        );
      } else if(!existingProduct) {
        await cartCollection.insertMany([
          {
            userId: req.session.userInfo._id,
            productId: req.params.id,
            productQuantity: req.body.productQuantity,
          },
        ]);
      }
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  };



const incQty = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity < cartProduct.productId.productStock) {
      cartProduct.productQuantity++;
    }
    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({ cartProduct, grandTotal: req.session.grandTotal });
  } catch (error) {
    console.error(error);
  }
};


const decQty = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity > 1) {
      cartProduct.productQuantity--;
    }
    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({ 
      cartProduct,
       grandTotal: req.session.grandTotal });
  } catch (error) {
    console.error(error);
  }
};
  
  const deleteFromCart = async (req, res) => {
    try {
      await cartCollection.findOneAndDelete({ _id: req.params.id });
      res.send("hello ur cart is deleted");
    } catch (error) {
      console.error(error);
    }
  };


  const getcheckoutpagefn = async (req, res) => {
    try {
      const addresscheck = await addressCollection.find({userId:req.session?.userInfo?._id})
      if(addresscheck.length==0){
          res.redirect("/addressAdd")
      }else{
        let cartData = await cartCollection
        .find({ userId: req.session.userInfo._id, productId: req.params.id })
        .populate("productId");
      let addressData = await addressCollection.find({
        userId: req.session.userInfo._id,
        primary:true
      });
      req.session.currentOrder = await orderCollection.create({
        userId: req.session.userInfo._id,
        orderNumber: (await orderCollection.countDocuments()) + 1,
        orderDate: new Date(),
        addressChosen: JSON.parse(JSON.stringify(addressData[0])),
        cartData: await grandTotal(req),
        grandTotalCost: req.session.grandTotal,
      });
      const coupons = await couponCollection.find(); 
      let userCartData = await grandTotal(req);
      req.session.save()
      res.render("user/checkout1", {
        signIn: req.session.signIn,
        user: req.body.user,
        currentUser: req.session.userInfo,
        grandTotal: req.session.grandTotal,
        userCartData,
        cartData,
        addressData: req.session.address,
        addressData,
        coupons: coupons 
      });
      }
    } catch (error) {
      res.redirect("/cart");
    }
  };
  
  const orderPlaced = async (req, res) => {
    try {
      if (req.body.razorpay_payment_id) {
        console.log("razorpay payment")
        await orderCollection.updateOne(
          { _id: req.session.currentOrder._id },
          {
            $set: {
              paymentId: req.body.razorpay_payment_id,
              paymentType: "Razorpay",
            },
          }
        );
        res.redirect("/checkout/orderPlacedEnd");
      } else if (req.body.walletPayment) {
        const walletData = await walletCollection.findOne({
          userId : req.session.userInfo._id,
        });
        if (walletData.walletBalance >= req.session.grandTotal) {
          walletData.walletBalance -= req.session.grandTotal;
          console.log("wallet tranaction data")
          let walletTransaction = {
            transactionDate : new Date(),
            transactionAmount: -req.session.grandTotal,
            transactionType: "Debited for placed order",
          };
          walletData.walletTransaction.push(walletTransaction)
          await walletData.save();
          await orderCollection.updateOne(
            { _id: req.session.currentOrder._id },
            {
              $set: {
                paymentId: Math.floor(Math.random()*9000000000) + 1000000000 ,
                paymentType: "Wallet",
              },
            })
          res.json({ success: true });
        } else {
          return res.json({ insufficientWalletBalance: true });
        }
      } else {
        console.log("incase of COD")
        await orderCollection.updateOne(
          { _id: req.session.currentOrder._id },
          {
            $set: {
              paymentId: "generatedAtDelivery",
              paymentType: "COD",
            },
          }
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(error);
    }
  };


  
  const orderPlacedEnd = async (req, res) => {
    try {
      console.log(`orderPlacedEnd`);
      console.log(req.body)
    let cartData = await cartCollection
      .find({ userId: req.session.userInfo._id })
      .populate("productId");

    for (const item of cartData) {
      item.productId.productStock -= item.productQuantity; // we use for reducing Qyantity
      item.productId.stockSold += 1;  //stocjSolf ++
      await item.productId.save();
    }
    cartData.map(async (v) => {
      v.productId.productStock -= v.productQuantity; //reducing from stock qty
      await v.productId.save();
      return v;
    })
    let orderData = await orderCollection.findOne({ _id: req.session.currentOrder._id})

    if(req.body.razorpay_payment_id){

      await orderCollection.updateOne({ _id: req.session.currentOrder._id}, { $set : { paymentType: 'online'   }  })

    }else if(orderData.paymentType =='online'){

      await orderCollection.updateOne({ _id: req.session.currentOrder._id}, { $set : { paymentType: 'COD'   }  })
    }
    
    let x = await cartCollection.findByIdAndUpdate({ _id: req.session.currentOrder._id}).populate("productId");
    res.render("user/checkout2", {
      signIn: req.session.signIn,
      user: req.session.user,
      orderCartData: cartData,
      orderData: req.session.currentOrder,
    });
    //delete product from cart since the order is placed
    await cartCollection.deleteMany({ userId: req.session.userInfo._id });
    } catch (error) {
      console.log(error)
    }
  };

  const applyCoupon = async (req, res) => {
    try {
      let { couponCode } = req.body;
      const userId = req.session.userInfo._id;
      let couponData = await couponCollection.findOne({ couponCode });
      if (!couponData) {
        return res.status(501).json({ couponApplied: false });
      }
      if (couponData.userId.includes(userId)) {
        return res.status(501).json({ couponApplied: false, couponAlreadyUsed: true });
      }
      let { grandTotal } = req.session;
      let { minimumPurchase, expiryDate } = couponData;
      let minimumPurchaseCheck = minimumPurchase < grandTotal;
      let expiryDateCheck = new Date() < new Date(expiryDate);
      if (minimumPurchaseCheck && expiryDateCheck) {
        let { discountPercentage, maximumDiscount } = couponData;
        let discountAmount =
          (grandTotal * discountPercentage) / 100 > maximumDiscount
            ? maximumDiscount
            : (grandTotal * discountPercentage) / 100;
        let { currentOrder } = req.session;
        await orderCollection.findByIdAndUpdate(
          { _id: currentOrder._id },
          {
            $set: { couponApplied: couponData._id },
            $inc: { grandTotalCost: -discountAmount },
          }
        );
        req.session.grandTotal -= discountAmount;
        await couponCollection.findByIdAndUpdate({_id: couponData._id}, { $push: { userId: userId } });
        res.status(202).json({ couponApplied: true, discountAmount });
      } else {
        res.status(501).json({ couponApplied: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  const storedApplycoupon =  async (req, res) => {
    try {
        const { orderId, discountAmount } = req.body;
        await orderCollection.findByIdAndUpdate(orderId, { totalDiscount: discountAmount });
        res.sendStatus(200); 
    } catch (error) {
        console.error('Error storing discount in order:', error);
        res.status(500).send('Internal Server Error'); 
    }
  };
  


  module.exports=
  {
    cartpagefn,
    addtoCart,
    decQty,
    incQty,
    deleteFromCart,
    getcheckoutpagefn,
    orderPlacedEnd,
    orderPlaced,
    storedApplycoupon,
    applyCoupon
  }