const mongoose = require("mongoose");
const dbUrl = process.env.MONGODB_URL;

const databaseName = process.env.DB_NAME;
console.log(dbUrl);

mongoose.connect(dbUrl + "/" + databaseName, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

console.log("Mongoose connected to " + databaseName + " database...");
