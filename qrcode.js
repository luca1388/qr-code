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
          reject(err);
        }
        console.log("done");
        let readStream = fs.createReadStream(outputPath);
        resolve(readStream);
      }
    );
  });
};

const createImageFromTextSync = (text, callback) => {
  QRCode.toFile(
    outputPath,
    text,
    {
      type: "png",
    },
    (err) => {
      if (err) {
        callback(err);
      }
      console.log("done");
      let readStream = fs.createReadStream(outputPath);
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
          reject(err);
        }
        console.log("done");
        resolve(stream);
      }
    );
  });
};

module.exports = {
  createImageFromText: createImageFromText,
  createStreamFromText: createStreamFromText,
  createImageFromTextSync: createImageFromTextSync
};
