const categoryCollection = require("../Model/categoryModel.js");
const orderCollection = require("../Model/orderModel.js");
const productCollection = require("../Model/productModel.js");

const productsCount = async () => {
  try {
    return await productCollection.countDocuments();
  } catch (error) {
    console.error(error);
  }
};

const categoryCount = async () => {
  try {
    return await categoryCollection.countDocuments();
  } catch (error) {
    console.error(error);
  }
};

const pendingOrdersCount = async () => {
  try {
    return await orderCollection.countDocuments({
      orderStatus: { $ne: "Delivered" },
    });
  } catch (error) {
    console.error(error);
  }
};

const shipping = async () => {
  try {
    return await orderCollection.countDocuments({ orderStatus: "Shipped" });
  } catch (error) {
    console.error(error);
  }
};

const completedOrdersCount = async () => {
  try {
    return await orderCollection.countDocuments({ orderStatus: "Delivered" });
  } catch (error) {
    console.error(error);
  }
};

const currentDayRevenue = async () => {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const result = await orderCollection.aggregate([
      { $match: { orderDate: { $gte: yesterday, $lt: today } } },
      { $group: { _id: "", totalRevenue: { $sum: "$grandTotalCost" } } },
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  } catch (error) {
    console.error(error);
  }
};

const MonthlyRevenue = async () => {
  try {
    const result = await orderCollection.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          dailyRevenue: { $sum: "$grandTotalCost" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 30,
      },
    ]);
   
    return {
      date: result.map((v) => v._id),
      revenue: result.map((v) => v.dailyRevenue),
    };
  } catch (error) {
    console.error(error);
  }
};


const categoryWiseRevenue = async () => {
  try {
      const result = await orderCollection.aggregate([
          { $unwind: "$cartData" },
          {
              $group: {
                  _id: "$cartData.productId.parentCategory",
                  revenuePerCategory: { $sum: "$cartData.totalCostPerProduct" },
              },
          },
      ]);

      return {
          categoryName: result.map((v) => v._id),
          revenuePerCategory: result.map((v) => v.revenuePerCategory),
      };
  } catch (error) {
      console.error(error);
  }
};

module.exports = {
  productsCount,
  categoryCount,
  pendingOrdersCount,
  completedOrdersCount,
  currentDayRevenue,
  categoryWiseRevenue,
  MonthlyRevenue,
  shipping,
};