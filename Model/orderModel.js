const mongoose= require('mongoose')

const orderSchema= new mongoose.Schema({
    userId: 
    { type: mongoose.Types.ObjectId,
      required: true,
    },
    orderNumber: 
    { type: Number,
      required: true
    },
    orderDate:
    {type: Date,
     required:true,
     default: new Date()},
    paymentType: 
    {type: String,
     default:'online'},
    orderStatus: 
    {type: String, 
    default:'Pending'},
    addressChosen : 
    { type: mongoose.Types.ObjectId,
     required: true,
      ref: 'address'},
    cartData: 
    { type: Array},
    grandTotalCost: 
    { type: Number},
    paymentId: 
    {type: String,}
})

const orderCollection= mongoose.model( 'orders', orderSchema )

module.exports= orderCollection

