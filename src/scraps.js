// Old versions of functions which were refactored:

// get user info for one user by id
router.get("/users/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            return res.send({
                success: false,
                message: "No user found with that id.",
            });
        }
        res.status(200);
        res.send({ success: true, user });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});


// update a user by id
router.patch("/users/:id", auth, async (req, res) => {
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
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            return res.send({
                success: false,
                message: "No user found with that id.",
            });
        }

        requestedUpdates.forEach((update) => {
            user[update] = req.body[update];
        });
        await user.save();

        res.status(200);
        res.send({ success: true, user });
    } catch (e) {
        res.status(400);
        res.send({ success: false, message: e.message });
    }
});
