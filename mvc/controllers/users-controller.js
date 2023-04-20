const usersService = require("../services/users-service");
const cookieParser = require("cookie-parser");

const createUser = async (req, res) => {
  let tmp = await usersService.findUserName(req.body.username);
  console.log("password: " + req.body.password);
  if (tmp) {
    return res.send("Username is taken");
  }
  tmp = await usersService.findUserEmail(req.body.email);
  if (tmp) {
    return res.send("Email is already in use");
  }
  const hashedPassword = await usersService.hashPassword(req.body.password, 8);
  const newUser = await usersService.createUser(
    req.body.username,
    req.body.email,
    hashedPassword
  );
  res.json(newUser); //consider adding statuses
};

const getIdByUsername = async (req, res) => {
  const username = req.session.user.username;
  const user = await usersService.findUserName(username);
  if (!user) {
    return res.status(404).send("User not found!");
  }
  const userId = user._id;
  res.json({ userId });
};

const changePassword = async (req ,res) => {
  const currentPassword = req.body.password;
  const isMatching = await usersService.comparePasswords(
    currentPassword,
    req.session.user.password
  );
  if (!isMatching){
    return res.send("Passwords don't match!");
  }
  const newPassword = req.body.newPassword;
  
  const newHashed = await usersService.hashPassword(newPassword,8);
  console.log('PPPP:',currentPassword,newPassword,newHashed,req.session.user.id,req.session.user._id);
  const user = await usersService.updateUser(req.session.user._id,'','',newHashed);
  res.json(user);
}

const loginUser = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("username", username, "password", password);
  const user = await usersService.findUserName(username);
  if (!user) {
    return res.send("One of the details is incorrect!");
  }
  const isMatching = await usersService.comparePasswords(
    password,
    user.password
  );
  if (!isMatching) {
    return res.send("One of the details is incorrect!");
  }
  req.session.user = user;
  //res.cookie('usernameCookie', username, { maxAge: 900000, httpOnly: true, secure: true });
  console.log("created a cookie!");
  if (user.isAdmin) {
    req.session.isAdmin = true;
  } else {
    req.session.isAdmin = false;
  }

  res.json(user);
};

const validateUser = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await usersService.findUserName(username);
  if (!user) {
    return res.json({ message: "User Not Found" });
  }
  const isMatching = await usersService.comparePasswords(
    password,
    user.password
  );
  if (!isMatching) {
    return res.json({ message: "Password is incorrect!" });
  }
  return res.json({ message: "OK" });
};

function logOut(req, res) {
  res.clearCookie("usernameCookie");

  req.session.destroy(function (err) {
    if (err) res.status(500).send("error while logging out", err);
    else res.status(200).send("successfully logged out!");
  });
}

const getUsers = async (req, res) => {
  const Users = await usersService.getUsers();
  res.json(Users);
};

const getUser = async (req, res) => {
  const User = await usersService.getUserById(req.params.userID);
  if (!User) {
    return res.status(404).json({ errors: ["User not found"] });
  }

  res.json(User);
};


const deleteUser = async (req, res) => {
  const User = await usersService.deleteUser(req.params.id);
  if (!User) {
    return res.status(404).json({ errors: ["User not found"] });
  }

  res.send();
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  deleteUser,
  loginUser,
  logOut,
  getIdByUsername,
  validateUser,
  changePassword,
};
