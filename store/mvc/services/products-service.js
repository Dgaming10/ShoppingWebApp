const { response } = require("express");
const Product = require("../models/products-model");

//SERVICES
//alert change
const createProduct = async (
  title,
  description,
  category,
  color,
  size,
  price,
  img
) => {
  const product = new Product({
    title: title,
    description: description,
    category: category,
    color: color,
    size: size,
    price: price,
    img: img,
  });

  return await product.save();
};

const getProducts = async () => {
  return await Product.find();
};

const productFilter = async (
  maxPrice,
  colorsQuery,
  sizesQuery,
  categoryQuery
) => {
  return await Product.find({
    price: { $gte: 1, $lte: maxPrice },
    color: colorsQuery,
    size: sizesQuery,
    category: categoryQuery,
  })
    .then((products) => {
      return products;
    })
    .catch((err) => {
      console.log("ERROR: " + err);
    });
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const getProductByTitle = async (title) => {
  return await Product.find({ title: title });
};

const getProductsByCategory = async (category) => {
  return await Product.find({ category: category });
};

const NumberOfProductsByCategory = async () => {
  return await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);
};

//alert change
const updateProduct = async (
  title,
  newTitle,
  description,
  category,
  color,
  size,
  price,
  img
) => {
  const x = await Product.findOneAndUpdate(
    { title: title },
    {
      $set: {
        title: newTitle,
        description: description,
        category: category,
        color: color,
        size: size,
        price: price,
        img: img,
      },
    }
  )
    .then((product) => {
      if (!product) {
        return res.status(404).send("Product not found while editing!");
      }
      return product;
    })
    .catch((err) => {
      return "ERROR";
    });
  return x;
};

//alert change
const deleteProduct = async (title) => {
  const x = await Product.findOneAndDelete({ title: title })
    .then((product) => {
      if (!product) {
        return res.status(404).send("Product not found while deleting!");
      }
      console.log("RETURING DELETE: " + product);
      return product;
    })
    .catch((err) => {
      res.status(500).send("ERROR WHILE DELETING: " + err.message);
    });
  console.log("X: " + x);
  return x;
};

module.exports = {
  createProduct,
  NumberOfProductsByCategory,
  getProductById,
  getProductsByCategory,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductByTitle,
  productFilter,
};
