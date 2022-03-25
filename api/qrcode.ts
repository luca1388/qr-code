// import qrcodTest from "../index";
import fetch from "node-fetch";
const telegramAPIBaseUrl = "https://api.telegram.org/bot";

export default async function handler(request, response) {
  const { message } = request.body;
  // message.chat.id
  // message.text
  console.log(message);

  await sendMessage(message.chat.id, "test!");

  response.status(200);
}

const sendMessage = async (chatId, text) => {
  const body = {
    body: {
      chat_id: chatId,
      method: "sendMessage",
      text: text,
    },
  };

  const res = await fetch(
    `${telegramAPIBaseUrl}/${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
  console.log(res.status);
  const data = await res.json();
  console.log(data);
  return data;
};
