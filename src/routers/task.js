const express = require("express");
const auth = require("../middleware/auth");
const { Task } = require("../models");

const router = new express.Router();

router.get("/tasks", auth, async (req, res) => {
    const filter = { owner: req.user._id };
    const sort = {};

    if (req.query.completed) {
        if (req.query.completed.toLowerCase() === "true") {
            filter.completed = true;
        } else if (req.query.completed.toLowerCase() === "false") {
            filter.completed = false;
        }
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        const tasks = await Task.find(filter)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort(sort);
        res.status(200);
        res.send(tasks);
    } catch (e) {
        res.status(500);
        res.send({ status: false, message: e.message });
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            res.status(404);
            return res.send({
                success: false,
                message: "No task found with that id for this user.",
            });
        }
        res.status(200);
        res.send({ success: true, task });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });

    try {
        const result = await task.save();
        res.status(201);
        res.send({ success: true, task: result.toObject() });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const allowedUpdates = ["description", "completed"];
    const requestedUpdates = Object.keys(req.body);
    const updateIsValid = requestedUpdates.every((u) => {
        return allowedUpdates.includes(u);
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
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            res.status(404);
            return res.send({
                success: false,
                message: "No task found with that id for this user.",
            });
        }

        requestedUpdates.forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();

        res.status(200);
        res.send({ success: true, task });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            res.status(404);
            return res.send({
                success: false,
                message: "No task found by that id for this user.",
            });
        }

        res.status(200);
        res.send({ success: true, task });
    } catch (e) {
        res.status(500);
        res.send(e.message);
    }
});

module.exports = router;
