const User = require("../models/users-model");
const bcrypt = require("bcrypt");
//SERVICES
const createUser = async (username, email, password) => {
  const user = new User({
    username: username,
    email: email,
    password: password,
  });

  return await user.save();
};

const hashPassword = async (password, numOfRounds) => {
  return await bcrypt.hash(password, numOfRounds);
};

const getUsers = async () => {
  return await User.find();
};

// const login = async (username, password) => {
//   const user = await User.findOne({email : email});
//   if(!user)
//   {
//     throw new Error('User not found');
//   }

//   const match = await bcrypt.compare(password, user.password);
//   //console.log(await bcrypt.hash("12345",10));
//   if(match)
//   {
//     return user;
//   }
//   else
//   {
//     throw new Error('Password is incorrect');
//   }
// };

const comparePasswords = async (password, hashedPassword) => {
  const matching = await bcrypt.compare(password, hashedPassword);
  return matching;
};

const findUserName = async (username) => {
  return await User.findOne({ username });
};

const findUserEmail = async (email) => {
  return await User.findOne({ email });
};
const getUserById = async (id) => {
  return await User.findById(id);
};

const updateUser = async (id, NewUsername, NewEmail, NewPassword) => {
  const user = await getUserById(id);
  if (!user) return null;

  if(NewUsername !== '')
  {
    user.username = NewUsername;
  }
  if(NewEmail !== '')
  {
    user.email = NewEmail;
  }
  if(NewPassword !== '')
  {
    user.password = NewPassword;
  }
  
  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const User = await getUserById(id);
  if (!User) return null;

  await User.remove();
  return User;
};

module.exports = {
  createUser,
  findUserName,
  findUserEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  comparePasswords,
  hashPassword,
};
