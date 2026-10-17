const jwt = require("jsonwebtoken");

const sendToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: `5d`,
  });
};

const sendTokenResponse = (res, statusCode, token, user, message) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  res.status(statusCode).json({
    success: true,
    message,
    user: safeUser,
    token,
  });
};

module.exports = { sendToken, sendTokenResponse };