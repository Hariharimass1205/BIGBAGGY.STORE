const mongoose = require("mongoose");

const categoryOfferSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"categories",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  offerPercentage: {
    type: Number,
    requierd: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});
const categoryOffercollection = mongoose.model("categoryOffer", categoryOfferSchema);
module.exports = categoryOffercollection
