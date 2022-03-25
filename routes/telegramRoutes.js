require("isomorphic-fetch");
const express = require("express");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const userMessage = req.body.message;

  const body = {
    chat_id: req.body.message.chat.id,
    method: "sendMessage",
    text: userMessage,
  };

  await fetch(
    `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );

  res.end();
};

router.post("/", handleNewMessage);

module.exports = router;
