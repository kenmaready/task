const express = require("express");
const multer = require("multer");
const shart = require("sharp");
const { User } = require("../models");
const auth = require("../middleware/auth");
const { response } = require("express");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account");
const sharp = require("sharp");

const router = new express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
            return cb(new Error("Only image files may be uploaded."));
        }
        cb(undefined, true);
    },
});

router.post("/signup", async (req, res) => {
    const user = new User(req.body);

    try {
        const results = await user.save();
        sendWelcomeEmail(user);
        const token = await user.generateAuthToken();

        res.status(201);
        res.send({ success: true, user: results, token });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();

        res.status(200);
        res.send({ success: true, user, token });
    } catch (e) {
        res.status(401);
        res.send({ success: false, message: e.message });
    }
});

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((t) => {
            return t.token !== req.token;
        });
        await req.user.save();

        res.status(200);
        res.send({ success: true, message: "User has been logged out." });
    } catch (e) {
        res.status(500);
        res.send({ success: false, message: e.message });
    }
});

router.post("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.status(200);
        res.send({
            success: true,
            message: "User has been logged out on all devices.",
        });
    } catch (e) {
        res.status(500);
        res.send({ success: false, message: e.message });
    }
});

router.get("/users/me", auth, async (req, res) => {
    res.send({ success: true, user: req.user });
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new Error("No user found with that id.");
        }

        if (!user.avatar) {
            throw new Error("User does not have an avatar.");
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (e) {
        res.status(400);
        res.send({ error: e.message });
    }
});

router.get("/users", auth, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200);
        res.send(users);
    } catch (e) {
        res.status(500);
        res.send({ success: false, message: e.message });
    }
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.user.avatar = buffer;

        try {
            await req.user.save();
            res.status(200);
            res.send({ success: true, message: "Avatar image uploaded." });
        } catch (e) {
            res.status(500);
            res.send({ error: e.message });
        }
    },
    (error, req, res, next) => {
        res.status(400);
        res.send({ error: error.message });
    }
);

router.patch("/users/me", auth, async (req, res) => {
    const allowedUpdates = ["name", "email", "password", "age"];
    const requestedUpdates = Object.keys(req.body);
    const updateIsValid = requestedUpdates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!updateIsValid) {
        res.status(400);
        return res.send({
            success: false,
            message:
                "Tried to update a field that does not exist or is not updatable.",
        });
    }

    try {
        requestedUpdates.forEach((update) => {
            req.user[update] = req.body[update];
        });
        await req.user.save();

        res.status(200);
        res.send({ success: true, user: req.user });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;

    try {
        await req.user.save();
        res.status(200);
        res.send({ success: true, message: "User avatar has been deleted." });
    } catch (e) {
        res.status(500);
        res.send({ error: e.message });
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        sendGoodbyeEmail(req.user);
        res.status(200);
        res.send({ success: true, user: req.user });
    } catch (e) {
        res.status(500);
        res.send({ success: false, message: e.message });
    }
});

module.exports = router;
