const Order = require("../models/orders-model");

//SERVICES
//alert change
const createOrder = async (order) => {
  const newOrder = new Order(order);
  return await newOrder.save();
};

const getAvgOrdersPerMonth = async () => {
  return await Order.aggregate([
    {
      $group: {
        _id: { $month: "$date" },
        avg: { $avg: "$price" },
      },
    },
  ]).sort("_id");
};

const getOrders = async () => {
  return await Order.find();
};

const getOrderById = async (id) => {
  return await Order.findById(id);
};

const getOrdersByUser = async (userID) => {
  return await Order.find({ userID: userID });
};

//alert change
const updateOrder = async (id, date, userID, products, price) => {
  const order = await getOrderById(id);
  if (!order) return null;

  order.date = date;
  order.userID = userID;
  order.products = products;
  order.price = price;
  await order.save();
  return order;
};

//alert change
const deleteOrder = async (id) => {
  const order = await getOrderById(id);
  if (!order) return null;

  await order.remove();
  return order;
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrders,
  updateOrder,
  deleteOrder,
  getAvgOrdersPerMonth,
};
