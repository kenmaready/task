const app = require("./app");
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("tasks api is running on port " + PORT + ".");
});
