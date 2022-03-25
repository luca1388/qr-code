import qrcodTest from "../index";

export default function handler(request, response) {
  const { message } = request.body;
  // message.chat.id
  // message.text

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}
