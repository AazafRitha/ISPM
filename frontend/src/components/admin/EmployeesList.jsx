import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeCard from "./EmployeeCard";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "./EmployeesList.css";

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [departments, setDepartments] = useState(["Software","Cyber","HR","Finance"]);

  const [openForm, setOpenForm] = useState(false);
  const [updateEmployee, setUpdateEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const fetchEmployees = () => {
    axios.get(`${BACKEND_URL}/employees`)
      .then(res => {
        setEmployees(res.data);
        const backendDepartments = [...new Set(res.data.map(emp => emp.department).filter(Boolean))];
        setDepartments(prev => [...new Set([...prev, ...backendDepartments])]);
      })
      .catch(() => console.log("Error fetching employees"));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleEditClick = (employee) => {
    setUpdateEmployee(employee);
    setOpenForm(true);
  };

  const handleAddClick = () => {
    setUpdateEmployee({
      employeeID: "",
      name: "",
      email: "",
      nic: "",
      address: "",
      password: "",
      department: "",
    });
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
  axios.delete(`${BACKEND_URL}/employees/${id}`)
      .then(() => setEmployees(prev => prev.filter(emp => emp._id !== id)))
      .catch(err => console.log("Delete error", err));
  };

  const handleFormChange = (e) => {
    setUpdateEmployee({ ...updateEmployee, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    if (!updateEmployee.name || !updateEmployee.employeeID || !updateEmployee.email) {
      return alert("Employee ID, Name, and Email are required.");
    }
    setLoading(true);
    try {
      if (updateEmployee._id) {
  await axios.put(`${BACKEND_URL}/employees/${updateEmployee._id}`, updateEmployee);
      } else {
  await axios.post(`${BACKEND_URL}/employees`, updateEmployee);
      }
      setOpenForm(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Failed to save employee. Possibly duplicate Employee ID, Name, or Email.");
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === "All" || emp.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="employee-list-page">
      <div className="header">
        <h1>Employee Directory</h1>
        <Button className="ghost-btn add-btn" onClick={handleAddClick}>Add Employee</Button>
      </div>

      <div className="filters">
        <TextField
          variant="outlined"
          placeholder="Search by name, email, ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
        />

        <FormControl size="small" className="department-select">
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            label="Department"
          >
            <MenuItem value="All">All</MenuItem>
            {departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="empty-state">No employees found.</p>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map(employee => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onUpdate={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{updateEmployee?._id ? "Update Employee" : "Add Employee"}</DialogTitle>
        <DialogContent dividers>
          <TextField label="Employee ID" name="employeeID" value={updateEmployee?.employeeID || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <TextField label="Name" name="name" value={updateEmployee?.name || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <TextField label="Email" name="email" value={updateEmployee?.email || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <TextField label="NIC" name="nic" value={updateEmployee?.nic || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <TextField label="Address" name="address" value={updateEmployee?.address || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <TextField label="Password (leave blank to keep existing)" type="password" name="password" value={updateEmployee?.password || ""} onChange={handleFormChange} fullWidth margin="dense" />
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select name="department" value={updateEmployee?.department || ""} onChange={handleFormChange}>
              <MenuItem value="">Select Department</MenuItem>
              {departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={loading}>
            {loading ? "Saving..." : updateEmployee?._id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeesList;
