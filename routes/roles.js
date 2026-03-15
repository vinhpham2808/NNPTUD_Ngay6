var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users'); // We need this for /roles/:id/users

// Lấy danh sách Roles (bỏ qua những cái đã xóa mềm)
router.get('/', async function(req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.status(200).send({
            success: true,
            data: roles
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// Lấy Role theo ID
router.get('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let role = await roleModel.findOne({ _id: id, isDeleted: false });
        if (role) {
            res.status(200).send({ success: true, data: role });
        } else {
            res.status(404).send({ success: false, message: "Role not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Tạo mới Role
router.post('/', async function(req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send({ success: true, data: newRole });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Cập nhật Role
router.put('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let updatedRole = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (updatedRole) {
            res.status(200).send({ success: true, data: updatedRole });
        } else {
            res.status(404).send({ success: false, message: "Role not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Xóa mềm Role (Soft delete)
router.delete('/:id', async function(req, res, next) {
    try {
        let id = req.params.id;
        let deletedRole = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (deletedRole) {
            res.status(200).send({ success: true, message: "Role deleted successfully", data: deletedRole });
        } else {
            res.status(404).send({ success: false, message: "Role not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// Lấy tất cả các user có role là id
// Lấy theo đường dẫn /roles/:id/users
router.get('/:id/users', async function(req, res, next) {
    try {
        let roleId = req.params.id;
        // Kiểm tra xem role tồn tại không
        let role = await roleModel.findOne({ _id: roleId, isDeleted: false });
        if (!role) {
            return res.status(404).send({ success: false, message: "Role not found" });
        }

        // Tìm tất cả user có reference tới roleId
        let users = await userModel.find({ role: roleId, isDeleted: false }).populate("role");
        res.status(200).send({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

module.exports = router;
