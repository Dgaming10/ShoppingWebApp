const { Router } = require("express");
const accountRouter = Router();

//home will directly be found in views folder

//request to change details
accountRouter.get("/details", (req, res) => {
  console.log(req.body);
  res.send("login to user");
});

//request to view orders
accountRouter.get("/orders", (req, res) => {
  console.log("hi");
});

module.exports = accountRouter;
