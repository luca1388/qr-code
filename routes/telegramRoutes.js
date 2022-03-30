const express = require("express");
const qrcode = require("../qrcode");
const { createUser, getDBUser, patchUser } = require("../models/users");
const {
  sendMessage,
  sendPhoto,
  editMessageReplyMarkup,
} = require("../telegram");
const dictionary = require("../i18n.json");

const router = express.Router();
const FREE_COUNT_THRESHOLD = 5;

const handleNewMessage = async (req, res, _next) => {
  console.log("New message received");
  let richMessage;

  const { callback_query, message } = req.body;
  if (!message && !callback_query) {
    console.log("Empty message received");
    console.log(req.body);
    res.end();
    closeRequest();
    return;
  }
  if (message?.text) {
    richMessage = message?.text;
  }
  const from = message?.from;
  const chat = message?.chat;
  const chatId = chat?.id;
  const userId = from?.id;

  console.log("Incoming message: ");
  console.log(message?.text);
  console.log(callback_query);
  if (callback_query) {
    richMessage = callback_query.data;
  }

  if (message?.text[0] === "/") {
    const command = message.text.toLowerCase().split("/")[1];
    // command detected
    switch (command) {
      case "informazioni":
        // Get user status and send count back
        sendMessage({
          chat_id: chatId,
          text: dictionary.status,
        });
        break;
      case "help":
        // send generic information to user about how the bot is working
        sendMessage({
          chat_id: chatId,
          text: dictionary.help,
        });
        break;
      case "start":
        // send welcome message
        sendMessage({
          chat_id: chatId,
          text: dictionary.welcome,
        });
        break;
      case "esci":
        // Erase data from database
        sendMessage({
          chat_id: chatId,
          text: dictionary.logout,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "No, voglio restare!",
                  callback_data: "/logout-abort",
                },
                {
                  text: "Si, addio.. o arrivederci?",
                  callback_data: "/logout-confirm",
                },
              ],
            ],
          },
        });
        break;
      case "/logout-confirm":
      case "/logout-abort":
        editMessageReplyMarkup({
          inline_message_id: callback_query.message.message_id,
        });
        break;
      default:
        // Send not understand message
        sendMessage({
          chat_id: chatId,
          text: dictionary.unknownCommand,
        });
    }
    closeRequest();
    res.end();
    return;
  } else {
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
          closeRequest();
          res.end();
          return;
        }
      }
      console.log("Updating qr counts for user");
      await patchUser(userFound.id, { count: userFound.count + 1 });
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
            closeRequest();
            res.end();
            return;
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
            closeRequest();
            res.end();
            return;
          }
        }
        res.end();
        return;
      }
    );
  }
};

const closeRequest = () => {
  console.log("Request closed");
  // res.end();
  // return;
};

router.post("/", handleNewMessage);

module.exports = router;
