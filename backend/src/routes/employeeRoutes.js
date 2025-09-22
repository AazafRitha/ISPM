import express from 'express';
import Employee from '../models/Employee.js';
import avatarUpload from '../middleware/avatarUpload.js';

const router = express.Router();

// Test route
router.get("/test", (req, res) => res.send("Employee routes are working"));

// Create employee
router.post("/", async (req, res) => {
    try {
        const { employeeID, name, email, nic, address, password, department } = req.body;

        // Check required fields
        if (!employeeID || !name || !email || !nic || !address || !password || !department) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Check for duplicates
        const existingEmployeeID = await Employee.findOne({ employeeID });
        if (existingEmployeeID) return res.status(400).json({ msg: "Employee ID already exists" });

        const existingEmail = await Employee.findOne({ email });
        if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

        const newEmployee = await Employee.create({ employeeID, name, email, nic, address, password, department });
        res.status(201).json({ msg: "Employee added successfully", employee: newEmployee });
    } catch (error) {
        res.status(500).json({ msg: "Failed to add employee", error: error.message });
    }
});

// Get all employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ msg: "Failed to fetch employees", error: error.message });
    }
});

// Get employee by ID
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ msg: "Employee not found" });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ msg: "Failed to fetch employee", error: error.message });
    }
});

// Update employee
router.put("/:id", avatarUpload.single('photo'), async (req, res) => {
    try {
        const { employeeID, name, email, nic, address, password, department } = req.body;

        const employeeExists = await Employee.findById(req.params.id);
        if (!employeeExists) return res.status(404).json({ msg: "Employee not found" });

        // Check for duplicates
        const existingEmployeeID = await Employee.findOne({ employeeID, _id: { $ne: req.params.id } });
        if (existingEmployeeID) return res.status(400).json({ msg: "Employee ID already exists" });

        const existingEmail = await Employee.findOne({ email, _id: { $ne: req.params.id } });
        if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

        const update = { employeeID, name, email, nic, address, password, department };
        if (req.file) {
            update.photoUrl = `/uploads/avatars/${req.file.filename}`;
        }
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );

        res.json({ msg: "Employee updated successfully", employee: updatedEmployee });
    } catch (error) {
        res.status(500).json({ msg: "Failed to update employee", error: error.message });
    }
});

// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) return res.status(404).json({ msg: "Employee not found" });
        res.json({ msg: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Failed to delete employee", error: error.message });
    }
});

// Get employee count
router.get("/count/all", async (req, res) => {
    try {
        const count = await Employee.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ msg: "Failed to get employee count", error: error.message });
    }
});

export default router;
