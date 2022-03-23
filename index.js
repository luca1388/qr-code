const QRCode = require("qrcode");

QRCode.toFile(
  "filename.png",
  "https://www.npmjs.com/package/qrcode#qr-code-options",
  {
      type: 'png',
  },
  function (err) {
    if (err) throw err;
    console.log("done");
  }
);
