const mongoose = require("mongoose");
const dbUrl = process.env.mongodb_url;

const databaseName = "tasks";
console.log(dbUrl);

mongoose.connect(dbUrl + "/" + databaseName, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

console.log("Mongoose connected to " + databaseName + " database...");
