const orderCollection = require("../Model/orderModel.js");
const formatDate = require("../service/dateFormate.js");

const getSalesData = async () => {
  try {
    const salesData = await orderCollection
      .find({ orderStatus: "Delivered" })
      .populate("userId");

    return salesData.map((order) => {
      return {
        orderNumber: order.orderNumber,
        orderDate: formatDate(order.orderDate),
        products: order.cartData.map((item) => item.productId.productName).join(", "),
        quantities: order.cartData.map((item) => item.productQuantity).join(", "),
        totalCost: order.grandTotalCost,
        paymentMethod: order.paymentType,
        orderStatus: order.orderStatus,
      };
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return []; 
  }
};

module.exports = getSalesData;