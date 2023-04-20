const { Router } = require("express");
const userRouter = Router();
const UserController = require("../controllers/users-controller");
const statusMSG = require("../../public/json/status-messages.json");

userRouter.post("/signup", UserController.createUser);

userRouter.post("/login", UserController.loginUser);

//userRouter.post("/updateUser", UserController.updateUser);
userRouter.post("/validuser", UserController.validateUser);

userRouter.get(
  "/",
  function (req, res, next) {
    //console.log(typeof req.session.user.username, typeof req.params.username)
    //console.log(req.session.user.username + " hey" + " " + req.params.username)
    if (req.session && req.session.user) {
      console.log("nexting");
      next();
    } 
    else {
      res.render(__dirname + "/../views/error/error");
    }
  },
  UserController.getIdByUsername
);


userRouter.post("/logout", UserController.logOut);
userRouter.put('/changePass',function(req,res,next){
  if (req.session && req.session.user)
  {
    next();
  }
},UserController.changePassword);
module.exports = userRouter;
