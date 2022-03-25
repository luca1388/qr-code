require("isomorphic-fetch");
const FormData = require("form-data");
const express = require("express");
const qrcode = require("../qrcode");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const userMessage = req.body.message;

  qrcode.createImageFromTextSync(
    userMessage.text,
    async (error, readStream) => {
      if (!error) {
        let form = new FormData();
        form.append("photo", readStream);
        await fetch(
          `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendPhoto?chat_id=${req.body.message.chat.id}`,
          {
            method: "POST",
            body: form,
          }
        );
        res.end();
      }
      const body = {
        chat_id: req.body.message.chat.id,
        method: "sendMessage",
        text: "Something went wrong :\ Please try again later.",
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
    }
  );
};

router.post("/", handleNewMessage);

module.exports = router;
