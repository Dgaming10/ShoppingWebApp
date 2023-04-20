const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
});

const Orders = mongoose.model("Orders", OrderSchema);
module.exports = Orders;

// (async function () {
//   const orders = await Orders.find();
//   for (const order of orders) {
//     if (!order.currency) {
//       await Orders.findByIdAndRemove(order._id);
//     }
//   }
// })();
