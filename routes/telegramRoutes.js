require("isomorphic-fetch");
const express = require("express");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

const handleNewMessage = async (req, res, _next) => {
  const userMessage = req.body.message;

  const body = {
    chat_id: chatId,
    method: "sendMessage",
    text: userMessage,
  };

  fetch(`${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
};

router.post("/", handleNewMessage);

module.exports = router;
