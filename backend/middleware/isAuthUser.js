const sendError = require("../utils/sendError");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const isAuthUser = async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || extraParts.length) {
    return sendError(res, 401, "Authentication required.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return sendError(res, 401, "Invalid or expired authentication token.");
    }
    return next(error);
  }

  if (!decoded || typeof decoded !== "object" || typeof decoded.userId !== "string") {
    return sendError(res, 401, "Invalid or expired authentication token.");
  }

  req.user = await userModel.findById(decoded.userId);
  if (!req.user) return sendError(res, 401, "Authentication required.");

  return next();
};

module.exports = isAuthUser;