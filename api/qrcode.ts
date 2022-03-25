// import qrcodTest from "../index";

export default function handler(request, response) {
  const { message } = request.body;
  // message.chat.id
  // message.text
  console.log(message);

  response.status(200).json({
    body: {
      chat_id: message.chat.id,
      method: 'sendMessage',
      text: 'test!'
    },
  });
}
