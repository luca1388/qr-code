require("isomorphic-fetch");
const FormData = require("form-data");
const express = require("express");
const qrcode = require("../qrcode");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const { message } = req.body;
  const { from, chat } = message;

  const chatId = chat.id;
  const userId = from.id;
  const userFound = await getDBUser(chatId);
  if (userFound) {
    console.log("user found!");
  } else {
    createUser({ chat_id: chatId, payment: null, id: userId, count: 0 });
    sendMessage({
      chat_id: chatId,
      method: "sendMessage",
      text: "Benvenuto!",
    });
  }

  qrcode.createImageFromTextSync(message.text, async (error, readStream) => {
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
    } else {
      const body = {
        chat_id: req.body.message.chat.id,
        method: "sendMessage",
        text: "Something went wrong : Please try again later.",
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
  });
};

const getDBUser = async (chatId) => {
  const users = await readUsersList();
  return users.find((user) => user.chat_id === chatId);
};

const createUser = async (user) => {
  try {
    response = await fetch(usersUrl, {
      method: "POST",
      body: user,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    throw new Error(e);
  }
};

const usersUrl = "https://api-project-941743174493.firebaseio.com/users.json";

const readUsersList = async () => {
  let response, users;
  try {
    response = await fetch(usersUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    users = await response.json();
  } catch (e) {
    console.error(e);
    users = [];
  }
  users = Object.keys(users).map((userKey) => ({
    ...users[userKey],
    id: userKey,
  }));
  return users;
};

const sendMessage = async (sendObject) => {
  await fetch(
    `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: JSON.stringify(sendObject),
      headers: { "Content-Type": "application/json" },
    }
  );
};

router.post("/", handleNewMessage);

module.exports = router;
