
const userCollection = require("../Model/userModel");
const walletCollection = require("../Model/walletModel");

module.exports = async (referralCode) => {
  try {
    let referralCodeExists = await userCollection.findOne({ referralCode });
    if (referralCodeExists) {
      let walletTransaction = {
        transactionDate: new Date(),
        transactionAmount: 500,
        transactionType: "Referral offer credited",
      };
      await walletCollection.updateOne(
        { userId: referralCodeExists._id },
        { $inc: { walletBalance: 500 }, $push: {walletTransaction} }
      );
    }
  } catch (error) {
    console.error(error);
  }
};