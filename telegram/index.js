require("isomorphic-fetch");
const FormData = require("form-data");

const telegramAPIBaseUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

const sendMessage = async (sendObject) => {
  await fetch(`${telegramAPIBaseUrl}/sendMessage`, {
    method: "POST",
    body: JSON.stringify(sendObject),
    headers: { "Content-Type": "application/json" },
  });
};

const sendPhoto = async (chatId, readStream) => {
  let form = new FormData();
  form.append("photo", readStream);
  await fetch(`${telegramAPIBaseUrl}/sendPhoto?chat_id=${chatId}`, {
    method: "POST",
    body: form,
  });
};

module.exports = {
  sendMessage: sendMessage,
  sendPhoto: sendPhoto,
};
