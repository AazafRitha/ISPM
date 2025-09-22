import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  employeeID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nic: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  department: { 
    type: String, 
    enum: ["Software", "Cyber", "HR", "Finance"], 
    required: true 
  },
  // Optional profile photo for employee
  photoUrl: { type: String, default: '' },
}, { timestamps: true });

// Prevent OverwriteModelError
const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;
