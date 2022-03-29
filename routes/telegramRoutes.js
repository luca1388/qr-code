const express = require("express");
const qrcode = require("../qrcode");
const { createUser, getDBUser, patchUser } = require("../models/users");
const { sendMessage, sendPhoto } = require("../telegram");

const router = express.Router();
const FREE_COUNT_THRESHOLD = 5;

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const { message } = req.body;
  const { from, chat } = message;
  const chatId = chat.id;
  const userId = from.id;

  if (message.text[0] === "/") {
    const command = message.text.toLowerCase().split("/")[1];
    // debug message
    sendMessage({
      chat_id: chatId,
      method: "sendMessage",
      text: `Command detected: ${command}`,
    });
    // command detected
    switch (command) {
      case "status":
        // Get user status and send count back
        break;
      case "help":
        // send generic information to user about how the bot is working
        break;
      case "start":
        // send welcome message
        break;
      case "delete":
        // Erase data from database
        break;
      default:
      // Send not understand message
    }
    res.end();
    return;
  }

  const userFound = await getDBUser(chatId);
  console.log(userFound);
  if (userFound) {
    console.log("user found!");
    if (userFound.count < FREE_COUNT_THRESHOLD) {
      patchUser(userFound.id, { count: userFound.count + 1 });
    } else {
      if (!userFound.premium) {
        // send message for payment
        sendMessage({
          chat_id: chatId,
          method: "sendMessage",
          text: `Hai raggiunto il limite di ${FREE_COUNT_THRESHOLD} QR code generati gratuitamente. Per continuare ad utilizzare il servizio SENZA LIMITI effettua il pagamento del piano premium che ti garantisce un numero illimitato di QR code generati.`,
        });
        res.end();
        return;
      }
    }
  } else {
    console.log("User not found, creating ...");
    await createUser({
      chat_id: chatId,
      payment_id: undefined,
      id: userId,
      count: 0,
      premium: false,
    });
  }

  qrcode.createImageFromTextSync(message.text, async (error, readStream) => {
    if (!error) {
      sendPhoto(chatId, readStream);
    } else {
      sendMessage({
        chat_id: req.body.message.chat.id,
        method: "sendMessage",
        text: "Something went wrong : Please try again later.",
      });
    }
    res.end();
  });
};

router.post("/", handleNewMessage);

module.exports = router;
