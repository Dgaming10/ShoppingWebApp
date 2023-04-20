const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRouter = require("./mvc/routes/user-router");
const accountRouter = require("./mvc/routes/my-account");
const productRouter = require("./mvc/routes/product-router");
const locationtRouter = require("./mvc/routes/location-router");
const pagesRouter = require("./mvc/routes/pages-router");
const ordersRouter = require("./mvc/routes/orders-router");
const twitterRouter = require("./mvc/routes/twitter-router");``
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const crypto = require("crypto");
var http = require("http").createServer(app);
const io = require("socket.io")(http);

// //**********
// const newLocal = require("custom-env");
// newLocal.env(process.env.NODE_ENV, "./config");
// //******* */

// try to match request to files in 'views' folder
//app.use(cookieParser());
app.use(express.static("mvc/views"));
app.set("view engine", "ejs");

mongoose
  .connect(
    "mongodb://admin:admin@ac-hb0n2yh-shard-00-00.zbtvvfi.mongodb.net:27017,ac-hb0n2yh-shard-00-01.zbtvvfi.mongodb.net:27017,ac-hb0n2yh-shard-00-02.zbtvvfi.mongodb.net:27017/?ssl=true&replicaSet=atlas-vg3yrv-shard-0&authSource=admin&retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to mongoDb");
  });

app.use(cors());
app.use(express.json()); // parses json format

//helps read the data sent in post request
app.use(express.urlencoded({ extended: true })); // parses form-data format

app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    saveUninitialized: false,
    resave: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));
let usersOnline = 0;
// try to match request to files in 'views' folder
app.use(function (req, res, next) {
  //console.log('req: ' + Object.keys(req.session))
  res.locals.isAdmin = false;
  let loggedIn = false;
  if (req.session && req.session.user) {
    loggedIn = true;
    //console.log(Object.keys(req.session));

    res.locals.username = req.session.user.username;
  }
  if (req.session && req.session.isAdmin) {
    res.locals.isAdmin = true;
  }
  // console.log('session: ' + Object.keys(req.session));
  res.locals.loggedIn = loggedIn;

  //console.log(res.locals.loggedIn);
  next();
});

app.use("/location", locationtRouter);
app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/account", accountRouter);
app.use("/orders", ordersRouter);
app.use("/", pagesRouter);
app.use('/twitter',twitterRouter );
app.use(function(req, res){
  res.render(__dirname + "/mvc/views/error/error.ejs");
});

io.on("connection", (socket) => {
  usersOnline++;
  io.emit('userCounter',usersOnline);
  console.log("new connection");

  socket.on("disconnect", () => {
    console.log("client disconnected");
    usersOnline--;
    io.emit('userCounter',usersOnline);
  });
  socket.on("removeProduct", (msg) => {
    io.emit("removeProdutFinal", msg);
  });

  socket.on("addProduct", (msg) => {
    io.emit("addProductFinal", msg);
  });

  socket.on("addOrder", (msg) => {
    io.emit("NotifyAddedOrder", msg);
  });

  socket.on("editProduct", (msg) => {
    io.emit("editProductFinal", msg);
  });

  socket.on("getUsersOnline", () => {
    socket.emit("usersOnline", usersOnline);
  });
});

const port = 3000;
http.listen(port, () =>
  console.log(`Server is listening: http://localhost:${port}/home-page/`)
);
