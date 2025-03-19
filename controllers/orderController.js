const orderCollection = require("../Model/orderModel")
const walletCollection = require("../Model/walletModel")
const userCollection = require("../Model/userModel")
const { generateInvoice } = require("../service/generatePDF.js");
const formatDate = require("../service/dateFormate")
const razorPay = require("razorpay")

const KeyId =  "rzp_test_yBYPpPQ1FzeSar"
const KeySecret = "N0zlDidgtQHj7bToX3POisV3"

let instance = new razorPay({
  key_id: "rzp_test_v75ssDWKeJR3Gp",
  key_secret: "gywIPeIcHdk4xGYGroN8opAg",
});


// order management page
const orderManagement = async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = 15;
      let skip = (page - 1) * limit;
  
      let count = await orderCollection.find().estimatedDocumentCount();
      let orderData = await orderCollection
        .find().sort({orderNumber: -1})
        .populate("userId").skip(skip).limit(limit);
        console.log(orderData)
      res.render("admin/orderManagement", { orderData, count, limit, page });
    } catch (error) {
      console.error(error);
    }
  };

  // pending
const changeStatusPending = async (req, res) => {
  try {
    await orderCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Pending" } }
    );
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.error(error);
  }
};


const changeStatusShipped = async (req, res) => {
  try {
    await orderCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Shipped" } }
    );
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.error(error);
  }
};

//deliverd
const changeStatusDelivered = async (req, res) => {
  try {
    await orderCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Delivered" } }
    );
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.error(error);
  }
};

//return
const changeStatusReturn = async (req, res) => {
  try {
    
    await orderCollection.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Return" } }
    );
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.error(error);
  }
};

//cancelled
const changeStatusCancelled = async (req, res) => {
  try {
    let orderData = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("userId");
    await walletCollection.findOneAndUpdate(
       { userId : orderData.userId._id  }, 
       { walletBalance: orderData.grandTotalCost })

    await userCollection.findByIdAndUpdate(
      { _id: orderData.userId._id },
      { wallet: orderData.grandTotalCost }
    );
    orderData.orderStatus = "Cancelled";
    orderData.save();
    res.redirect("/admin/orderManagement");
  } catch (error) {
    console.error(error);
  }
};



const allordersfn =  async (req, res) => {
  try {
    let page;
    let limit=10
    let skip;
    
    page = req.query.page  || 1
    skip = (page-1)  * limit
    
    
    let orderData = await orderCollection.find({
      userId: req.session.userInfo._id,
    }).sort({orderNumber:-1}).skip(skip).limit(limit)

    let count = await orderCollection.find({userId:req.session.userInfo._id}).countDocuments()

    //sending the formatted date to the page
    orderData = orderData.map((v) => {
      v.orderDateFormatted = formatDate(v.orderDate);
      return v;
    });

    res.render("user/orders", {
      currentUser: req.session.userInfo,
      orderData,
      count,
      limit
    });
  } catch (error) {
    console.error(error);
  }
}

const singleorderfn =  async (req, res) => {
  try {
    let orderData = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("addressChosen");
    let isCancelled = orderData.orderStatus == "Cancelled";
    let isReturn = orderData.orderStatus == "Return";
    res.render("user/singleorderpage", {
      currentUser: req.session.userInfo,
      orderData,
      isCancelled,
      isReturn,
    });
  } catch (error) {
    console.error(error);
  }
}
  const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const orderData = await orderCollection.findOne({ _id: req.params.id });

       await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Cancelled", cancelReason } }
    );
    if(orderData.orderStatus == 'Delivered' &&  orderData.paymentType == 'COD' || orderData.paymentType == 'online' || orderData.paymentType == 'Wallet' ){

    let walletTransaction = {
      transactionDate: new Date(),
      transactionAmount: orderData.grandTotalCost,
      transactionType: "Refund from cancelled Order",
    };
    await walletCollection.findOneAndUpdate(
      { userId: req.session.userInfo._id },
      {
        $inc: { walletBalance: orderData.grandTotalCost },
        $push: { walletTransaction },
      }
    );
  }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}


 const returnRequest = async (req, res) => {
  try {
    const { ReturnReason } = req.body;
    const orderData = await orderCollection.findOne({ _id: req.params.id });
    await orderCollection.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { orderStatus: "Return", ReturnReason } }
    );
    
    let walletTransaction = {
      transactionDate: new Date(),
      transactionAmount: orderData.grandTotalCost,
      transactionType: "Refund from cancelled Order",
    };

    await walletCollection.findOneAndUpdate(
      { userId: req.session.userInfo._id },
      {
        $inc: { walletBalance: orderData.grandTotalCost },
        $push: { walletTransaction },
      }
    )
      res.json({ success: true });
  } catch (error) {
    console.error(error);
  }
}
 

const genOrder = async (req,res)=>{
  try{
      req.session.save()
      const payMentValue = req.body
      instance.orders
        .create({
          amount: Number(req.params.id) + "00",
          currency: "INR",
          receipt: "receipt#1",
        }).then((order) => {
          res.json(order)
          // return res.send({ orderId: order.id });
        }).catch((err)=>{
          console.log(err)
        });
  }catch(err){
      console.log(err)
  }
}
const downloadInvoice =  async (req, res) => {
  try {
    let orderData = await orderCollection
      .findOne({ _id: req.params.id })
      .populate("addressChosen");
    // Extract order number
    const orderNumber = orderData.orderNumber;
    // Construct filename with order number
    const filename = `invoice_order_${orderNumber}.pdf`;
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
    });
    generateInvoice(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      orderData
    );
  } catch (error) {
    console.error(error);
  }
}


  module.exports = {
    orderManagement,
    changeStatusPending,
    allordersfn,
    cancelOrder,
    returnRequest,
    singleorderfn,
    changeStatusShipped,
    changeStatusDelivered,
    changeStatusReturn,
    changeStatusCancelled,
    genOrder,
    downloadInvoice
}
  