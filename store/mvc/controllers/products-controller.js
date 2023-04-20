const productsServices = require("../services/products-service");

//check return functions
const createProduct = async (req, res) => {
  const newProduct = await productsServices.createProduct(
    req.body.title,
    req.body.description,
    req.body.category,
    req.body.color,
    req.body.size,
    req.body.price,
    req.body.img
  );
  res.json(newProduct);
};

const getProducts = async (req,res) => {
  const Products = await productsServices.getProducts();
  return Products;
};

// const addToCart = async (req, res) => {
  
// };

const getProductsByCategory = async (req, res) => {
  const Products = await productsServices.getProductsByCategory(req.category);
  res.json(Products);
};

const NumberOfProductsByCategory = async (req, res) => {
  const NumByCategory = await productsServices.NumberOfProductsByCategory();
  res.json(NumByCategory);
};

const getProductById = async (req, res) => {
  try{
    const Product = await productsServices.getProductById(req.params.id);
    if (!Product) {
      return res.status(404).json({ errors: ["Product not found"] });
    }
  
    res.json(Product);
  }catch(err)
  {
    return res.status(404).json({ errors: ["Please enter a valid ID!"] });
  }
  
  
};

const getProductByTitle = async (req, res) => {
  const Product = await productsServices.getProductByTitle(req.params.title);
  console.log("PRODUCT: " + typeof Product);
  if (Object.keys(Product).length === 0) {
    return res.status(404).json({ errors: ["Product not found"] });
  }

  res.json(Product);
};
const colorJSON = require('../../public/json/colors.json');
const sizeJSON = require('../../public/json/size.json');
const categoryJSON = require('../../public/json/category.json');
const productFilter = async (req, res) => {
  let colorQuery = req.query.colors;
  let sizeQuery = req.query.sizes;
  let categoryQuery = req.query.category;
  if(req.query.colors !== undefined)
  {
    colorQuery = {$in: req.query.colors};
  }
  else
  {

    let allColors = [];
    for(let i = 0; i < colorJSON.length; i++)
    {
      allColors.push(colorJSON[i].toLowerCase());
    }
    //console.log("ALLCOLORS: " + allColors);
    colorQuery = {$in: allColors};
  }
  if(req.query.sizes !== undefined)
  {
    sizeQuery = {$in: req.query.sizes};
  }
  else
  {

    let allSizes = [];
    for(let i = 0; i < sizeJSON.length; i++)
    {
      allSizes.push(sizeJSON[i].toLowerCase());
    }
    //console.log("ALLCOLORS: " + allColors);
    sizeQuery = {$in: allSizes};
  }
  if(req.query.category !== undefined)
  {
    categoryQuery = {$in: req.query.category};
  }
  else
  {

    let allCategories = [];
    for(let i = 0; i < categoryJSON.length; i++)
    {
      allCategories.push(categoryJSON[i].toLowerCase());
    }
    //console.log("ALLCOLORS: " + allColors);
    categoryQuery = {$in: allCategories};
  }
  const Products = await productsServices.productFilter(req.query.maxPrice,colorQuery,sizeQuery,categoryQuery);
  if (!Products) {
    return res.json({ massage: ["Products not found"] });
  }
  res.json(Products);
};

const updateProduct = async (req, res) => {
  const Product = await productsServices.updateProduct(
    req.params.title,
    req.body.newTitle,
    req.body.description,
    req.body.category
    ,req.body.color,
    req.body.size,
    req.body.price);
  if (!Product) {
    return res.status(404).json({ errors: ["Product not found while editing"] });
  }

  res.json(Product);
};

const deleteProduct = async (req, res) => {
  console.log("GOT AS PARAM: " + req.params.title);
  const product = await productsServices.deleteProduct(req.params.title);
  
  if (!product) {
    return res.status(404).json({ errors: ["Product not found"] });
  }
  res.send();
};

module.exports = {
  createProduct,
  NumberOfProductsByCategory,
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByTitle,
  productFilter,
};
