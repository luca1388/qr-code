const fs = require("fs");
const QRCode = require("qrcode");

const createImageFromText = (text, outputPath) => {
  return new Promise((resolve, reject) => {
    QRCode.toFile(
      outputPath,
      text,
      {
        type: "png",
      },
      (err) => {
        if (err) {
          console.error("Image NOT created");
          reject(err);
        }
        console.log("Image created with success");
        let readStream = fs.createReadStream(outputPath);
        resolve(readStream);
      }
    );
  });
};

const createImageFromTextSync = (text, uuid, callback) => {
  const imagePath = `./qr-${uuid}.png`;
  QRCode.toFile(
    imagePath,
    text,
    {
      type: "png",
    },
    (err) => {
      if (err) {
        console.error("Image NOT created");
        callback(err);
      }
      console.log("Image created with success");
      let readStream = fs.createReadStream(imagePath);
      callback(null, readStream);
    }
  );
};

const src = "./qr.png";

const createStreamFromText = (text) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(src);
    QRCode.toFileStream(
      stream,
      text,
      {
        type: "png",
      },
      (err) => {
        if (err) {
          console.error("Image NOT created");
          reject(err);
        }
        console.log("Image created with success");
        resolve(stream);
      }
    );
  });
};

module.exports = {
  createImageFromText: createImageFromText,
  createStreamFromText: createStreamFromText,
  createImageFromTextSync: createImageFromTextSync,
};
