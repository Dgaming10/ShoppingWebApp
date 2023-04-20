const { Router } = require("express");
const pagesRouter = Router();
const countries = require("../../public/json/countries.json");
const sizes = require("../../public/json/size.json");
const colors = require("../../public/json/colors.json");
const categories = require("../../public/json/category.json");
const OrdersServices = require("../services/orders-service");

pagesRouter.get(
  "/login",
  function (req, res, next) {
    if (!req.session.user) {
      next();
    } else {
      res.redirect("/home-page");
    }
  },function(req, res){
    res.render("../mvc/views/login/login.ejs");
  }
);

pagesRouter.get("/register", function (req, res) {
  res.render("../mvc/views/register/register.ejs");
});

pagesRouter.get("/home-page", function (req, res) {
  res.render("../mvc/views/home-page/index.ejs");
});

pagesRouter.get(
  "/admin",
  function (req, res, next) {
    //console.log('isAdmin: ' + req.session.isAdmin);
    if (req.session && req.session.isAdmin) {
      next();
    }
    else {
      res.render(__dirname + "/../views/error/error");
    }
  },
  function (req, res) {
    res.render("../mvc/views/admin/index.ejs");
  }
);

pagesRouter.get("/products", function (req, res) {
  const products = res.locals.products;
  let isAdmin = false;
  if (req.session && req.session.isAdmin) {
    isAdmin = true;
  }
  let isLoggedV = false;
  if (req.session && req.session.user) {
    isLoggedV = true;
  }
  //console.log('isLoggedV',isLoggedV,req.session,Object.keys(req.session));
  res.render("../mvc/views/shopping-page/index.ejs", {
    elements: products,
    countries: countries,
    sizes: sizes,
    colors: colors,
    categories: categories,
    isAdmin: isAdmin,
    isLogged: isLoggedV,
  });
  delete res.locals.products;
});

pagesRouter.get("/about-us", function (req, res) {
  res.render("../mvc/views/about-us/index.ejs");
});

pagesRouter.get("/my-account", async function (req, res) {
  const userId = req.session.user?._id;
  if (!userId) {
    return res.redirect("/login");
  }
  const userOrders = await OrdersServices.getOrdersByUser(userId);
  console.log(userOrders);
  res.render("../mvc/views/my-account/index.ejs", {
    userOrders,
  });
});

module.exports = pagesRouter;
