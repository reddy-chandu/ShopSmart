const express = require("express");
const { sendChatMessage } = require("../Controllers/chatController");

const route = express.Router();

route.post("/message", sendChatMessage);

module.exports = route;