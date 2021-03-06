import "isomorphic-fetch";

const telegramAPIBaseUrl = "https://api.telegram.org/bot";

export default async function handler(request, response) {
  const { message } = request.body;
  // message.chat.id
  // message.text
  console.log(message);

  // sendMessage(message.chat.id, "test!");
  response.status(200).json({
    body: {
      chat_id: message.chat.id,
      method: "sendMessage",
      text: "test!",
    },
    query: request.query,
    cookies: request.cookies,
  });;
  
}

// const sendMessage = async (chatId, text) => {
//   const body = {
//     chat_id: chatId,
//     method: "sendMessage",
//     text: text,
//   };

//   fetch(`${telegramAPIBaseUrl}${process.env.TELEGRAM_TOKEN}/sendMessage`, {
//     method: "POST",
//     body: JSON.stringify(body),
//     headers: { "Content-Type": "application/json" },
//   });
// };
