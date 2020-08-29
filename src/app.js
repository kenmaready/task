const express = require("express");
require("./db/mongoose");
const { userRouter, taskRouter } = require("./routers");

const PORT = process.env.port;
const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get("/", (req, res) => {
    res.send({ success: true, name: "Tasks API" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("tasks api is running on port " + PORT + ".");
});
