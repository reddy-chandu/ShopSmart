const userModel = require("../models/userModel");
const reviewsModel = require("../models/reviewsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendError = require("../utils/sendError");
const { sendToken, sendTokenResponse } = require("../utils/sendToken");

//User Register
const userRegister = async (req, res) => {
  try {
    const { firstName, lastName, password, confirmPassword } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const isUserExit = await userModel.findOne({ email });
    if (isUserExit) {
      res.status(400).json({
        success: false,
        message: ["Oops! Email Already Exit..!!"],
      });
    } else {
      if (password == confirmPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        });
        res.status(201).json({
          success: true,
          message: "User Register SuccessFully..!!",
          user: {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
          },
          NewUser: {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
          },
        });
      } else {
        sendError(res, 400, ["Passwords Field Mismatch"]);
      }
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).map((key) => {
        errors[key] = error.errors[key].message;
      });
      sendError(res, 400, Object.values(errors));
    } else {
      sendError(res, 400, ["Somethings Went Wrong..!!"]);
    }
  }
};

//User Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      const isUserExit = await userModel.findOne({ email: normalizedEmail }).select("+password");
      if (isUserExit) {
        const isPassMatch = await bcrypt.compare(password, isUserExit.password);
        if (isUserExit.email && isPassMatch) {
          const token = sendToken(isUserExit._id);
          sendTokenResponse(
            res,
            200,
            token,
            isUserExit,
            "User Login SuccessFully..!!"
          );
        } else {
          sendError(res, 400, "Invalid Email & Password");
        }
      } else {
        sendError(res, 400, "Invalid Email & Password");
      }
    } else {
      sendError(res, 400, "Invalid Email & Password");
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//Change User Password
const changeUserPassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    if (password && confirm_password) {
      if (password === confirm_password) {
        if (password.length >= 4) {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          const user = await userModel.findById(req.user._id);
          user.password = newHashPassword;
          await user.save();
          res.status(201).json({
            success: true,
            message: "Password Updated..!!",
          });
        } else {
          sendError(res, 400, "Password: Minimum Four Character");
        }
      } else {
        sendError(res, 400, "Passwords Field Mismatch");
      }
    } else {
      sendError(res, 400, "All Field Required");
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Get Logged User Data
const getLoggedUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const updateMyAccount = async (req, res) => {
  try {
    const firstName = typeof req.body.firstName === "string" ? req.body.firstName.trim() : "";
    const lastName = typeof req.body.lastName === "string" ? req.body.lastName.trim() : "";
    const rawAddress = req.body.deliveryAddress || {};
    const deliveryAddress = {
      address: typeof rawAddress.address === "string" ? rawAddress.address.trim() : "",
      city: typeof rawAddress.city === "string" ? rawAddress.city.trim() : "",
      mobileNumber: typeof rawAddress.mobileNumber === "string" ? rawAddress.mobileNumber.trim() : "",
      pinCode: typeof rawAddress.pinCode === "string" ? rawAddress.pinCode.trim() : "",
    };

    if (firstName.length < 2 || !lastName) {
      return sendError(res, 400, "Enter a first name with at least 2 characters and a last name.");
    }

    const addressValues = Object.values(deliveryAddress);
    const hasAddress = addressValues.some(Boolean);
    if (hasAddress && addressValues.some((value) => !value)) {
      return sendError(res, 400, "Complete every delivery address field or leave them all blank.");
    }
    if (deliveryAddress.mobileNumber && !/^\d{10}$/.test(deliveryAddress.mobileNumber)) {
      return sendError(res, 400, "Mobile number must contain exactly 10 digits.");
    }
    if (deliveryAddress.pinCode && !/^\d{6}$/.test(deliveryAddress.pinCode)) {
      return sendError(res, 400, "PIN code must contain exactly 6 digits.");
    }

    req.user.firstName = firstName;
    req.user.lastName = lastName;
    req.user.deliveryAddress = deliveryAddress;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Account details saved.",
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        deliveryAddress: req.user.deliveryAddress,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, Object.values(error.errors).map((item) => item.message));
    }
    sendError(res, 500, "Could not save account details.");
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await userModel.findByIdAndDelete(userId);
    await reviewsModel.deleteMany({ user: userId });
    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    sendError(res, 500, "Could not delete account.");
  }
};

//Send Password Reset Email To User
const sendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      const isUserExit = await userModel.findOne({ email: normalizedEmail });
      if (isUserExit) {
        const token = jwt.sign(
          { userId: isUserExit._id },
          process.env.JWT_RESET_PASSWORD_SECRET_KEY,
          {
            expiresIn: "5m",
          }
        );
        //Send Password Reset Mail
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
          },
        });
        const link = `${req.protocol}://${req.get("host")}/reset-password/${
          isUserExit._id
        }/${token}`;
        await transporter.sendMail({
          from: process.env.SMPT_MAIL,
          to: isUserExit.email,
          subject: "ShopSmart - Password Reset Link",
          html: `<h2>Hello ${isUserExit.firstName}</h2><br>
            <center>
            <h5>Your Password Reset Link is <a href=${link}>Click Here To Reset Password</a> </h5>
            </center>     `,
        });
        res.status(200).json({
          success: true,
          message: `Password Reset Link Send To ${isUserExit.email}`,
        });
      } else {
        sendError(res, 400, "User Not Exit");
      }
    } else {
      sendError(res, 400, "Email Field Is Required..!!");
    }
  } catch (error) {
    sendError(res, 400, error);
  }
};

//Password Reset
const userPasswordReset = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    const { id, token } = req.params;
    const decoded = await jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET_KEY);
    if (decoded.userId !== id) return sendError(res, 400, "Invalid password reset link.");
    if (password && confirm_password) {
      if (password === confirm_password) {
        if (password.length >= 4) {
              const user = await userModel.findById(id);
              if (!user) return sendError(res, 404, "User Not Found");
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          res.status(200).json({
            success: true,
            message: "Password Reset SuccessFully..!!",
          });
        } else {
          sendError(res, 400, "Password: Minimum Four Character");
        }
      } else {
        sendError(res, 400, "Both Password Field Not Match..!!");
      }
    } else {
      sendError(res, 400, "All Field Are Required..!!");
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      sendError(res, 400, "Invalid Token Or Expired");
    } else {
      sendError(res, 400, "Something Went To Wrong..!!");
    }
  }
};

//get all orders admin
const adminGetAllUsers = async (req, res) => {
  try {
    const userDocCount = await userModel.find().countDocuments();
    const AllUsers = await userModel.find().sort({ _id: -1 });
    res.status(200).json({
      success: true,
      AllUsers,
      userDocCount,
      message: "All Orders Get SuccessFully..!!",
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};
//Delete Product
const AdminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const isUserExit = await userModel.findById(userId);
      if (isUserExit) {
        const DeletedUser = await userModel.findByIdAndDelete(userId);
        res.status(200).json({
          success: true,
          message: "User Deleted Successfully..!!",
          DeletedUser,
        });
      } else {
        sendError(res, 400, "User Not Found");
      }
    } else {
      sendError(res, 400, "User Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, "Somethings Is Wrong");
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const isUserExit = await userModel.findById(userId);
      if (isUserExit) {
        isUserExit.role = req.body.UserRole;
        await isUserExit.save();
        res.status(200).json({
          success: true,
          message: "User Role Updated..!!",
          isUserExit,
        });
      } else {
        sendError(res, 400, "User Not Found..!!");
      }
    } else {
      sendError(res, 400, "User Not Found..!!");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

module.exports = {
  userRegister,
  userLogin,
  changeUserPassword,
  getLoggedUser,
  updateMyAccount,
  deleteMyAccount,
  sendUserPasswordResetEmail,
  userPasswordReset,
  adminGetAllUsers,
  AdminDeleteUser,
  adminUpdateUser,
};