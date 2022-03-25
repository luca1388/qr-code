import "isomorphic-fetch";

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
    chat_id: chatId,
    method: "sendMessage",
    text: text,
  };

  await fetch(
    `${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
};
