const express = require("express");
const qrcode = require("../qrcode");
const { createUser, getDBUser, patchUser } = require("../models/users");
const { sendMessage, sendPhoto } = require("../telegram");

const router = express.Router();
const FREE_COUNT_THRESHOLD = 5;

const handleNewMessage = async (req, res, _next) => {
  console.log("New message received");

  const { message } = req.body;
  const { from, chat } = message;
  const chatId = chat.id;
  const userId = from.id;

  if (message.text[0] === "/") {
    const command = message.text.toLowerCase().split("/")[1];
    // debug message
    console.log(`Command detected: ${command}`);
    // TODO: remove
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
    closeRequest(res);
  }

  const userFound = await getDBUser(chatId);
  if (userFound) {
    console.log("User already provisioned");

    if (userFound.count > FREE_COUNT_THRESHOLD) {
      console.log("User exceeds free count limit");
      if (!userFound.premium) {
        console.log("User is not premium");
        console.log("Sending message for payment");
        // send message for payment
        try {
          sendMessage({
            chat_id: chatId,
            method: "sendMessage",
            text: `Hai raggiunto il limite di ${FREE_COUNT_THRESHOLD} QR code generati gratuitamente. Per continuare ad utilizzare il servizio SENZA LIMITI effettua il pagamento del piano premium che ti garantisce un numero illimitato di QR code generati.`,
          });
        } catch (e) {
          console.error("Telegram communication error", e);
        }
        closeRequest(res);
      }
    }
  } else {
    console.log("User not found, creating ...");
    await createUser({
      chat_id: chatId,
      payment_id: undefined,
      from_id: userId,
      count: 0,
      premium: false,
    });
  }

  console.log("Updating qr counts for user");
  await patchUser(userFound.id, { count: userFound.count + 1 });

  console.log("Start creating QR code");
  qrcode.createImageFromTextSync(
    message.text,
    `${chatId}`,
    async (error, readStream) => {
      if (!error) {
        console.log("QR code created: sending to user ...");
        try {
          sendPhoto(chatId, readStream);
        } catch (e) {
          console.error("Telegram communication error", e);
          closeRequest(res);
        }
      } else {
        console.error(
          "Error while creating QR code: sending error message to user ..."
        );
        try {
          sendMessage({
            chat_id: req.body.message.chat.id,
            method: "sendMessage",
            text: "Something went wrong, please try again later.",
          });
        } catch (e) {
          console.error("Telegram communication error", e);
          closeRequest(res);
        }
      }
      closeRequest(res);
    }
  );
};

const closeRequest = (res) => {
  console.log("Request closed");
  res.end();
  return;
};

router.post("/", handleNewMessage);

module.exports = router;
