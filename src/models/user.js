const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { isEmail } = require("validator");
const Task = require("./task");

const secret = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate: (value) => {
                if (!isEmail(value)) {
                    throw new Error(
                        "Email provided is not in a valid email format."
                    );
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate: (value) => {
                if (value.match(/.*password.*/i)) {
                    throw new Error(
                        "Password cannot contain the word 'password' in it."
                    );
                }
            },
        },
        age: {
            type: Number,
            validate: (age) => {
                if (age < 0) {
                    throw new Error("Age must be a positive number.");
                }
            },
        },
        avatar: {
            type: Buffer,
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});

userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, secret);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// function to find a user by email and password:
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) throw new Error("No user found with that email.");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error("Unable to login with those credentials.");

    return user;
};

// hash a plain text password before saving:
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// delete user tasks when user is deleted:
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
