const express = require("express");
const bodyParser = require("body-parser");

const telegramRoutes = require("./routes/telegramRoutes");

const app = express();

app.use(bodyParser.json());

// Telegram expects the backend to have a POST endpoint named "/new-message"
app.use("/new-message", telegramRoutes);

app.get("/", (req, res, next) => {
  res.status(200);
  res.json({
    message: "Alive",
  });
});

// If a request comes here it means nobody handles it and
app.use(() => {
  throw new Error("Could not find the requested resource.");
});

app.use((error, _req, res, next) => {
  if (error) {
    console.log(error);
  }

  if (res.headerSent) {
    // It means that response was already sent out
    return next(error);
  }

  res.status(404);
  res.json({
    message: error.message || "An unknown error occoured.",
  });
});

app.listen(process.env.PORT || 5000);