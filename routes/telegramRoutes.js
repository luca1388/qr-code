require("isomorphic-fetch");
const FormData = require("form-data");
const express = require("express");
const qrcode = require("../qrcode");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const userMessage = req.body.message;

  const body = {
    chat_id: req.body.message.chat.id,
    method: "sendMessage",
    text: userMessage.text,
  };

  await fetch(
    `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
  let form = new FormData();
  const stream = await qrcode.createStreamFromText(userMessage.text);

  form.append("photo", stream);
  await fetch(
    `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendPhoto?chat_id=${req.body.message.chat.id}`,
    {
      method: "POST",
      body: form,
    }
  );

  res.end();
};

router.post("/", handleNewMessage);

module.exports = router;
