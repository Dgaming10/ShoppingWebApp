const OrdersServices = require("../services/orders-service");
const { getProductById } = require("../services/products-service");

//check return functions
const createOrder = async (req, res) => {
  console.log("body:", req.body);
  const orderDetails = req.body;
  const newOrder = await OrdersServices.createOrder(orderDetails);
  res.json(newOrder);
};

const getOrders = async (req, res) => {
  const orders = await OrdersServices.getOrders();
  res.json(orders);
};

const getAvgOrdersPerMonth = async (req, res) => {
  const orders = await OrdersServices.getAvgOrdersPerMonth();
  res.json(orders);
};

const getOrdersByUser = async (req, res) => {
  const orders = await OrdersServices.getOrdersByUser(req.body.userID);
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await OrdersServices.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ errors: ["Order not found"] });
  }

  res.json(order);
};

const getOrderItemsByOrderId = async (req, res) => {
  const order = await OrdersServices.getOrderById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ errors: ["Order not found"] });
  }

  const products = [];
  for (const productId of order.products) {
    const product = await getProductById(productId);
    products.push(product);
  }

  res.json({ ...order._doc, products });
};

const updateOrder = async (req, res) => {
  //make sure to send all the data
  if (!req.body.products) {
    res.status(400).json({
      message: "the order must have products in it",
    });
  }

  const order = await OrdersServices.updateOrder(
    req.params.id,
    req.body.date,
    req.body.userID,
    req.body.products,
    req.body.price
  );
  if (!order) {
    return res.status(404).json({ errors: ["Order not found"] });
  }

  res.json(order);
};

const deleteOrder = async (req, res) => {
  const order = await OrdersServices.deleteOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ errors: ["Order not found"] });
  }
  res.send();
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrders,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
  getAvgOrdersPerMonth,
  getOrderItemsByOrderId,
};
