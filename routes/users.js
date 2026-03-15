var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// Lấy danh sách Users (bỏ qua những cái đã xóa mềm)
router.get('/', async function(req, res, next) {
    try {
        let users = await userModel.find({ isDeleted: false }).populate('role');
        res.status(200).send({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// Lấy User theo ID
router.get('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let user = await userModel.findOne({ _id: id, isDeleted: false }).populate('role');
        if (user) {
            res.status(200).send({ success: true, data: user });
        } else {
            res.status(404).send({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Tạo mới User
router.post('/', async function(req, res, next) {
    try {
        let newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).send({ success: true, data: newUser });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Cập nhật User
router.put('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let updatedUser = await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (updatedUser) {
            res.status(200).send({ success: true, data: updatedUser });
        } else {
            res.status(404).send({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Xóa mềm User (Soft delete)
router.delete('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let deletedUser = await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (deletedUser) {
            res.status(200).send({ success: true, message: "User deleted successfully", data: deletedUser });
        } else {
            res.status(404).send({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Enable User
// POST /enable truyền lên email và username
router.post('/enable', async function(req, res, next) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ success: false, message: "Email and username are required" });
        }

        let user = await userModel.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { status: true },
            { new: true }
        );

        if (user) {
            res.status(200).send({ success: true, message: "User enabled successfully", data: user });
        } else {
            res.status(404).send({ success: false, message: "Wrong email or username, or user not found" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// Disable User
// POST /disable truyền lên email và username
router.post('/disable', async function(req, res, next) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ success: false, message: "Email and username are required" });
        }

        let user = await userModel.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { status: false },
            { new: true }
        );

        if (user) {
            res.status(200).send({ success: true, message: "User disabled successfully", data: user });
        } else {
            res.status(404).send({ success: false, message: "Wrong email or username, or user not found" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
