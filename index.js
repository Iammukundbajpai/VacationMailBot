const express = require("express");
const app = express();
const authRouter = require("./auth");

app.use("/", authRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
