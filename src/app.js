const express = require("express");
require("./db/mongoose");
const { userRouter, taskRouter } = require("./routers");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get("/", (req, res) => {
    res.send({ success: true, name: "Tasks API" });
});

module.exports = app;
