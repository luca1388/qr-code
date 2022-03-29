require("isomorphic-fetch");
const FormData = require("form-data");
const express = require("express");
const qrcode = require("../qrcode");
const router = express.Router();
const telegramAPIBaseUrl = "https://api.telegram.org/bot";
const usersUrl = "https://api-project-941743174493.firebaseio.com/users.json";
const patchUserUrl = (userid) =>
  `https://api-project-941743174493.firebaseio.com/users/${userid}.json`;

const FREE_COUNT_THRESHOLD = 5;

const handleNewMessage = async (req, res, _next) => {
  console.log(req.body);
  const { message } = req.body;
  const { from, chat } = message;

  const chatId = chat.id;
  const userId = from.id;
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

const patchUser = async (id, data) => {
  let response;
  console.log("patching user with data:");
  console.log(data);
  try {
    response = await fetch(patchUserUrl(id), {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    console.log("User updated");
  } catch (e) {
    console.log("User not updated");
    throw new Error(e);
  }

  if (response.status === 200) {
    console.log("User updated with success");
  }
};

const createUser = async (user) => {
  console.log("Creating this user: ");
  console.log(user);
  console.log(`url: ${usersUrl}`);
  let response;
  try {
    response = await fetch(usersUrl, {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
    console.log("User created");
  } catch (e) {
    console.log("User not created");
    throw new Error(e);
  }

  console.log(response.status);
  if (response.status === 200) {
    console.log("User created with success");
  }
};

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
