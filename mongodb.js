const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "tasksExample";

// Examples of generating your own ObjectID:
//const id = new ObjectID();
//console.log("Object ID: " + id);
//console.log("Time created: " + id.getTimestamp());

const useDB = (operation) => {
    MongoClient.connect(
        connectionURL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (error, client) => {
            if (error) {
                return console.log(error);
            }

            console.log("Connected to db...");
            const db = client.db(databaseName);

            operation(db);
        }
    );
};

const writeToDB = (db) => {
    // insert one record (document):
    db.collection("users").insertOne(
        {
            name: "Ken Maready",
            age: 51,
        },
        (error, result) => {
            if (error) {
                return console.log(error);
            }
            console.log(result.ops);
        }
    );

    // inserting more than one record (document) at a time:
    db.collection("users").insertMany(
        [
            { name: "Julie Rivera", age: 29 },
            { name: "Jen Morales", age: 27 },
        ],
        (error, result) => {
            if (error) {
                return console.log(error);
            }
            console.log(result.ops);
        }
    );

    db.collection("tasks").insertMany(
        [
            { description: "Clean litterbox", completed: false },
            { description: "Do Laundry", completed: true },
            { description: "Cook dinner", completed: false },
        ],
        (error, { ops }) => {
            if (error) {
                return console.log(error);
            }
            console.log(ops);
        }
    );
};

const readFromDB = (db) => {
    // select a document by attribute (user by name):
    db.collection("users").findOne(
        { name: /^ken maready$/i },
        (error, user) => {
            if (error) {
                return console.log(error);
            }

            console.log("Case insensitive name search result:");
            console.log(user);
        }
    );

    // select a document by ID (get user by _id):
    db.collection("users").findOne(
        { _id: new ObjectID("5f4255dc9e085a61eca60ee8") },
        (error, user) => {
            if (error) {
                return console.log(error);
            }

            console.log(user);
        }
    );

    // find all documents meeting certain criteria:
    db.collection("users")
        .find({ age: { $gt: 20, $lt: 30 } })
        .toArray((error, users) => {
            if (error) {
                return console.log(error);
            }

            console.log(users);
        });

    db.collection("users")
        .find({ age: 29 })
        .count((error, count) => {
            if (error) {
                return console.log(error);
            }

            console.log(count);
        });

    db.collection("tasks")
        .find({ _id: new ObjectID("5f4255dc9e085a61eca60eec") })
        .toArray((error, tasks) => {
            if (error) {
                return console.log(error);
            }

            console.log("Challenge Time:");
            console.log("1. Find task by Id:");
            tasks.forEach((t) => console.log(t.description));
        });

    db.collection("tasks")
        .find({ completed: false })
        .toArray((error, tasks) => {
            if (error) {
                return console.log(error);
            }

            console.log("2. Find all tasks that are not completed:");
            tasks.forEach((t) => console.log(t.description));
        });
};

const updateDB = (db) => {
    db.collection("users")
        .updateOne(
            {
                _id: new ObjectID("5f4255dc9e085a61eca60ee9"),
            },
            { $set: { name: "Vanessa Morales" } }
        )
        .then((result) => {
            console.log(result.result);
        })
        .catch((error) => {
            console.log(error);
        });

    db.collection("users")
        .updateMany({ age: { $lt: 30 } }, { $inc: { age: +1 } })
        .then((result) => {
            console.log(result.result);
        })
        .catch((error) => {
            console.log(error);
        });

    db.collection("tasks")
        .updateMany({ completed: false }, { $set: { completed: true } })
        .then((result) => {
            console.log(result.result);
        })
        .catch((error) => {
            console.log(error);
        });
};

const deleteFromDB = (db) => {
    // delete all tasks with 'clean' or 'Clean' in the description:
    // db.collection("tasks")
    //     .deleteMany({
    //         description: { $in: [/.*clean.*/i] },
    //     })
    //     .then((result) => {
    //         console.log(result.result);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });

    // same as above but delete only ONE item meeting the filter
    // criteria:
    db.collection("tasks")
        .deleteOne({
            description: { $in: [/.*clean.*/i] },
        })
        .then((result) => {
            console.log(result.result);
        })
        .catch((error) => {
            console.log(error);
        });
};

//useDB(writeToDB);
//useDB(readFromDB);
//useDB(updateDB);
useDB(deleteFromDB);
